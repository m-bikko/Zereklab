import { getDatabase } from '@/lib/mongodb';
import { extractPhoneDigits } from '@/lib/phoneUtils';
import PendingBonus from '@/models/PendingBonus';

import { NextRequest, NextResponse } from 'next/server';

// Get pending bonuses for a customer
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');
  const name = searchParams.get('name');

  if (!phone && !name) {
    return NextResponse.json(
      { error: 'Phone number or full name is required' },
      { status: 400 }
    );
  }

  try {
    await getDatabase();

    const filter: Record<string, unknown> = { isProcessed: false };

    let pendingBonuses;

    if (phone) {
      // Search by phone digits
      const searchDigits = extractPhoneDigits(phone);
      const allPendingBonuses = await PendingBonus.find({
        isProcessed: false,
      }).lean();
      pendingBonuses = allPendingBonuses.filter(
        bonus => extractPhoneDigits(bonus.phoneNumber) === searchDigits
      );
      // Sort by availableDate
      pendingBonuses.sort(
        (a, b) =>
          new Date(a.availableDate).getTime() -
          new Date(b.availableDate).getTime()
      );
    } else if (name) {
      // Search by name
      filter.fullName = { $regex: name.trim(), $options: 'i' };
      pendingBonuses = await PendingBonus.find(filter).sort({
        availableDate: 1,
      });
    }

    if (!pendingBonuses) {
      pendingBonuses = [];
    }

    // Separate into available and upcoming bonuses
    const now = new Date();
    const availableBonuses = pendingBonuses.filter(
      bonus => bonus.availableDate <= now
    );
    const upcomingBonuses = pendingBonuses.filter(
      bonus => bonus.availableDate > now
    );

    return NextResponse.json({
      pendingBonuses: {
        available: availableBonuses,
        upcoming: upcomingBonuses,
        totalAvailable: availableBonuses.reduce(
          (sum: number, bonus: { bonusAmount: number }) =>
            sum + Number(bonus.bonusAmount || 0),
          0
        ),
        totalUpcoming: upcomingBonuses.reduce(
          (sum: number, bonus: { bonusAmount: number }) =>
            sum + Number(bonus.bonusAmount || 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error('Failed to fetch pending bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending bonuses' },
      { status: 500 }
    );
  }
}
