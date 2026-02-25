import { getDatabase } from '@/lib/mongodb';
import Bonus from '@/models/Bonus';

import { NextResponse } from 'next/server';

// Get all bonuses for admin management
export async function GET() {
  try {
    await getDatabase();

    // Fetch all bonus records sorted by creation date (newest first)
    const bonuses = await Bonus.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(bonuses);
  } catch (error) {
    console.error('Failed to fetch all bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bonuses' },
      { status: 500 }
    );
  }
}
