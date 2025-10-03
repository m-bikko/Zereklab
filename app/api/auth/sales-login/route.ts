import { getDatabase } from '@/lib/mongodb';
import SalesStaff from '@/models/SalesStaff';

import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find sales staff member
    const staff = await SalesStaff.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, staff.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    staff.lastLogin = new Date();
    await staff.save();

    return NextResponse.json({
      username: staff.username,
      fullName: staff.fullName,
    });
  } catch (error) {
    console.error('Sales login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}