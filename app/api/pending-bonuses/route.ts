import { getDatabase } from '@/lib/mongodb';
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

    if (phone) {
      filter.phoneNumber = phone;
    } else if (name) {
      filter.fullName = { $regex: name.trim(), $options: 'i' };
    }

    // Get all pending bonuses for the customer
    const pendingBonuses = await PendingBonus.find(filter).sort({ availableDate: 1 });

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
        totalAvailable: availableBonuses.reduce((sum: number, bonus: { bonusAmount: number }) => sum + Number(bonus.bonusAmount || 0), 0),
        totalUpcoming: upcomingBonuses.reduce((sum: number, bonus: { bonusAmount: number }) => sum + Number(bonus.bonusAmount || 0), 0),
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