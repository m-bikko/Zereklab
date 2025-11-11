import { getDatabase } from '@/lib/mongodb';
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

    // Validate phone format
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +7 (777) 123-12-12' },
        { status: 400 }
      );
    }

    const bonus = await Bonus.findOneAndUpdate(
      { phoneNumber },
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