import { getDatabase } from '@/lib/mongodb';
import Quote from '@/models/Quote';

import { NextRequest, NextResponse } from 'next/server';

// GET - Get all quotes for admin management
export async function GET() {
  try {
    await getDatabase();

    const quotes = await Quote.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: quotes,
      count: quotes.length,
    });
  } catch (error) {
    console.error('Error getting all quotes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get quotes' },
      { status: 500 }
    );
  }
}

// PUT - Update a quote
export async function PUT(request: NextRequest) {
  try {
    await getDatabase();

    const body = await request.json();
    const { id, text, author, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    if (!text?.trim() || !author?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Text and author are required' },
        { status: 400 }
      );
    }

    const quote = await Quote.findByIdAndUpdate(
      id,
      {
        text: text.trim(),
        author: author.trim(),
        isActive: isActive ?? true,
      },
      { new: true, runValidators: true }
    );

    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quote,
      message: 'Quote updated successfully',
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}
