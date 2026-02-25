import { getDatabase } from '@/lib/mongodb';
import Quote from '@/models/Quote';

import { NextRequest, NextResponse } from 'next/server';

// Default fallback quotes in case database is empty
const DEFAULT_QUOTES = [
  {
    text: 'Образование — это самое мощное оружие, которое вы можете использовать, чтобы изменить мир.',
    author: 'Нельсон Мандела',
    isActive: true,
  },
  {
    text: 'Скажи мне — и я забуду, покажи мне — и я запомню, дай мне сделать — и я пойму.',
    author: 'Конфуций',
    isActive: true,
  },
  {
    text: 'Будущее принадлежит тем, кто верит в красоту своих мечтаний.',
    author: 'Элеонора Рузвельт',
    isActive: true,
  },
  {
    text: 'Единственный способ делать великую работу — это любить то, что ты делаешь.',
    author: 'Стив Джобс',
    isActive: true,
  },
  {
    text: 'Каждый ребенок — художник. Проблема в том, как остаться художником, когда вырастешь.',
    author: 'Пабло Пикассо',
    isActive: true,
  },
  {
    text: 'Не бойтесь расти медленно, бойтесь остаться на месте.',
    author: 'Китайская пословица',
    isActive: true,
  },
  {
    text: 'Творчество — это интеллект, который веселится.',
    author: 'Альберт Эйнштейн',
    isActive: true,
  },
  {
    text: 'Лучший способ предсказать будущее — это создать его.',
    author: 'Питер Друкер',
    isActive: true,
  },
];

// GET - Get a random quote
export async function GET() {
  try {
    await getDatabase();

    // Try to get quotes from database
    const quotes = await Quote.find({ isActive: true });

    // If no quotes in database, use defaults
    const availableQuotes = quotes.length > 0 ? quotes : DEFAULT_QUOTES;

    // Get random quote
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    const randomQuote = availableQuotes[randomIndex];

    return NextResponse.json({
      success: true,
      data: randomQuote,
      isDefault: quotes.length === 0,
    });
  } catch (error) {
    console.error('Error getting random quote:', error);

    // Return a default quote if everything fails
    const fallbackQuote =
      DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];

    return NextResponse.json({
      success: true,
      data: fallbackQuote,
      isDefault: true,
      error: 'Using fallback quote',
    });
  }
}

// POST - Add a new quote
export async function POST(request: NextRequest) {
  try {
    await getDatabase();

    const body = await request.json();
    const { text, author } = body;

    if (!text?.trim() || !author?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Text and author are required' },
        { status: 400 }
      );
    }

    const quote = new Quote({
      text: text.trim(),
      author: author.trim(),
      isActive: true,
    });

    await quote.save();

    return NextResponse.json({
      success: true,
      data: quote,
      message: 'Quote created successfully',
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a quote
export async function DELETE(request: NextRequest) {
  try {
    await getDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    const quote = await Quote.findByIdAndDelete(id);

    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}
