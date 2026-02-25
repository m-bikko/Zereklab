import { getDatabase } from '@/lib/mongodb';
import { extractPhoneDigits } from '@/lib/phoneUtils';
import Bonus from '@/models/Bonus';

import { NextRequest, NextResponse } from 'next/server';

// Update customer's full name
export async function POST(request: NextRequest) {
  try {
    await getDatabase();

    const body = await request.json();
    const { phoneNumber, fullName } = body;

    if (!phoneNumber || !fullName?.trim()) {
      return NextResponse.json(
        { error: 'Phone number and full name are required' },
        { status: 400 }
      );
    }

    // Find bonus by matching phone digits
    const searchDigits = extractPhoneDigits(phoneNumber);
    const allBonuses = await Bonus.find({}).lean();
    const bonusRecord = allBonuses.find(
      b => extractPhoneDigits(b.phoneNumber) === searchDigits
    );

    if (!bonusRecord) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const bonus = await Bonus.findByIdAndUpdate(
      bonusRecord._id,
      { fullName: fullName.trim() },
      { new: true }
    );

    if (!bonus) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      phoneNumber: bonus.phoneNumber,
      fullName: bonus.fullName,
      availableBonuses: bonus.availableBonuses,
      totalBonuses: bonus.totalBonuses,
      usedBonuses: bonus.usedBonuses,
      lastUpdated: bonus.lastUpdated,
    });
  } catch (error) {
    console.error('Failed to update full name:', error);
    return NextResponse.json(
      { error: 'Failed to update full name' },
      { status: 500 }
    );
  }
}
