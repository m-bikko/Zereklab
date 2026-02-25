import { getDatabase } from '@/lib/mongodb';
import { extractPhoneDigits } from '@/lib/phoneUtils';
import Bonus from '@/models/Bonus';

import { NextRequest, NextResponse } from 'next/server';

// Deduct bonuses from customer account
export async function POST(request: NextRequest) {
  try {
    await getDatabase();

    const body = await request.json();
    const { phoneNumber, bonusesToDeduct } = body;

    if (!phoneNumber || typeof bonusesToDeduct !== 'number') {
      return NextResponse.json(
        { error: 'Phone number and bonusesToDeduct are required' },
        { status: 400 }
      );
    }

    if (bonusesToDeduct <= 0) {
      return NextResponse.json(
        { error: 'Bonuses to deduct must be positive' },
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
        { error: 'Customer not found in bonus system' },
        { status: 404 }
      );
    }

    const bonus = await Bonus.findById(bonusRecord._id);

    if (!bonus) {
      return NextResponse.json(
        { error: 'Customer not found in bonus system' },
        { status: 404 }
      );
    }

    // Check if customer has enough available bonuses
    if (bonus.availableBonuses < bonusesToDeduct) {
      return NextResponse.json(
        {
          error: `Insufficient bonuses. Available: ${bonus.availableBonuses}, Requested: ${bonusesToDeduct}`,
        },
        { status: 400 }
      );
    }

    // Deduct bonuses by adding to usedBonuses
    bonus.usedBonuses += bonusesToDeduct;
    bonus.availableBonuses = bonus.totalBonuses - bonus.usedBonuses;
    bonus.lastUpdated = new Date();

    await bonus.save();

    return NextResponse.json({
      phoneNumber: bonus.phoneNumber,
      availableBonuses: bonus.availableBonuses,
      totalBonuses: bonus.totalBonuses,
      usedBonuses: bonus.usedBonuses,
      bonusesDeducted: bonusesToDeduct,
      lastUpdated: bonus.lastUpdated,
    });
  } catch (error) {
    console.error('Failed to deduct bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to deduct bonuses' },
      { status: 500 }
    );
  }
}
