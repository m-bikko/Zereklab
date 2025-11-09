import { getDatabase } from '@/lib/mongodb';
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

    // Validate phone format
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +7 (777) 123-12-12' },
        { status: 400 }
      );
    }

    if (bonusesToDeduct <= 0) {
      return NextResponse.json(
        { error: 'Bonuses to deduct must be positive' },
        { status: 400 }
      );
    }

    const bonus = await Bonus.findOne({ phoneNumber });
    
    if (!bonus) {
      return NextResponse.json(
        { error: 'Customer not found in bonus system' },
        { status: 404 }
      );
    }

    // Check if customer has enough available bonuses
    if (bonus.availableBonuses < bonusesToDeduct) {
      return NextResponse.json(
        { error: `Insufficient bonuses. Available: ${bonus.availableBonuses}, Requested: ${bonusesToDeduct}` },
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