import { getDatabase } from '@/lib/mongodb';
import SalesStaff from '@/models/SalesStaff';

import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

// Update sales staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getDatabase();
    
    const { id } = params;
    const body = await request.json();
    const { fullName, isActive, password } = body;

    const staff = await SalesStaff.findById(id);
    if (!staff) {
      return NextResponse.json(
        { error: 'Sales staff member not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (fullName) {
      staff.fullName = fullName.trim();
    }
    
    if (typeof isActive === 'boolean') {
      staff.isActive = isActive;
    }

    // Update password if provided
    if (password && password.length >= 6) {
      staff.password = await bcrypt.hash(password, 12);
    }

    await staff.save();

    // Return updated info without password
    const staffInfo = {
      _id: staff._id,
      username: staff.username,
      fullName: staff.fullName,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      lastLogin: staff.lastLogin,
    };

    return NextResponse.json(staffInfo);
  } catch (error) {
    console.error('Failed to update sales staff:', error);
    return NextResponse.json(
      { error: 'Failed to update sales staff' },
      { status: 500 }
    );
  }
}

// Delete sales staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getDatabase();
    
    const { id } = params;
    
    const staff = await SalesStaff.findById(id);
    if (!staff) {
      return NextResponse.json(
        { error: 'Sales staff member not found' },
        { status: 404 }
      );
    }

    await SalesStaff.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Sales staff member deleted successfully' });
  } catch (error) {
    console.error('Failed to delete sales staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete sales staff' },
      { status: 500 }
    );
  }
}