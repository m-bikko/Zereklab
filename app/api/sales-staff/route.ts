import { getDatabase } from '@/lib/mongodb';
import SalesStaff from '@/models/SalesStaff';

import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

// Get all sales staff (for admin)
export async function GET() {
  try {
    await getDatabase();

    const staff = await SalesStaff.find({})
      .select('-password') // Don't return passwords
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Failed to fetch sales staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales staff' },
      { status: 500 }
    );
  }
}

// Create new sales staff member (for admin)
export async function POST(request: NextRequest) {
  try {
    await getDatabase();

    const body = await request.json();
    const { username, password, fullName } = body;

    // Validate input
    if (!username || !password || !fullName) {
      return NextResponse.json(
        { error: 'Username, password, and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingStaff = await SalesStaff.findOne({
      username: username.toLowerCase(),
    });
    if (existingStaff) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new staff member
    const newStaff = new SalesStaff({
      username: username.toLowerCase(),
      password: hashedPassword,
      fullName: fullName.trim(),
      isActive: true,
    });

    await newStaff.save();

    // Return staff info without password
    const staffInfo = {
      _id: newStaff._id,
      username: newStaff.username,
      fullName: newStaff.fullName,
      isActive: newStaff.isActive,
      createdAt: newStaff.createdAt,
    };

    return NextResponse.json(staffInfo, { status: 201 });
  } catch (error) {
    console.error('Failed to create sales staff:', error);
    return NextResponse.json(
      { error: 'Failed to create sales staff' },
      { status: 500 }
    );
  }
}
