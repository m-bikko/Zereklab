import { getDatabase } from '@/lib/mongodb';
import Bonus from '@/models/Bonus';
import { extractPhoneDigits } from '@/lib/phoneUtils';

import { NextRequest, NextResponse } from 'next/server';

// Get bonus by phone number or full name
export async function GET(request: NextRequest) {
  try {
    await getDatabase();
    
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');
    const fullName = searchParams.get('name');

    if (!phoneNumber && !fullName) {
      return NextResponse.json(
        { error: 'Phone number or full name is required' },
        { status: 400 }
      );
    }

    let bonus;

    if (phoneNumber) {
      // Extract digits from the search phone number
      const searchDigits = extractPhoneDigits(phoneNumber);
      
      // Find bonus by matching phone digits
      const allBonuses = await Bonus.find({}).lean();
      bonus = allBonuses.find(b => extractPhoneDigits(b.phoneNumber) === searchDigits);
      
      if (bonus) {
        // Convert back to mongoose document
        bonus = await Bonus.findById(bonus._id);
      }
      
      if (!bonus) {
        // Create new bonus record if doesn't exist
        // Use the original formatted phone number from the request
        bonus = new Bonus({
          phoneNumber,
          totalBonuses: 0,
          usedBonuses: 0,
          availableBonuses: 0,
        });
        await bonus.save();
      }
    } else if (fullName) {
      // Search by full name (case insensitive)
      bonus = await Bonus.findOne({ 
        fullName: { $regex: fullName.trim(), $options: 'i' } 
      });
      
      if (!bonus) {
        return NextResponse.json(
          { error: 'Customer not found with this name' },
          { status: 404 }
        );
      }
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
    console.error('Failed to fetch bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bonuses' },
      { status: 500 }
    );
  }
}

// Add bonuses to customer account
export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { phoneNumber, bonusesToAdd } = body;

    if (!phoneNumber || typeof bonusesToAdd !== 'number') {
      return NextResponse.json(
        { error: 'Phone number and bonusesToAdd are required' },
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

    if (bonusesToAdd < 0) {
      return NextResponse.json(
        { error: 'Bonuses to add must be positive' },
        { status: 400 }
      );
    }

    let bonus = await Bonus.findOne({ phoneNumber });
    
    if (!bonus) {
      bonus = new Bonus({
        phoneNumber,
        totalBonuses: bonusesToAdd,
        usedBonuses: 0,
        availableBonuses: bonusesToAdd,
      });
    } else {
      bonus.totalBonuses += bonusesToAdd;
      bonus.availableBonuses = bonus.totalBonuses - bonus.usedBonuses;
    }

    await bonus.save();

    return NextResponse.json({
      phoneNumber: bonus.phoneNumber,
      availableBonuses: bonus.availableBonuses,
      totalBonuses: bonus.totalBonuses,
      bonusesAdded: bonusesToAdd,
    });
  } catch (error) {
    console.error('Failed to add bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to add bonuses' },
      { status: 500 }
    );
  }
}