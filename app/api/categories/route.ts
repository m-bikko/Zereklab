import { getDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
import { validateCategory } from '@/types';

import { NextRequest, NextResponse } from 'next/server';

// For type consistency if needed

export async function GET() {
  try {
    await getDatabase();
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(categories, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[API_CATEGORIES_GET]', error);
    return NextResponse.json(
      { error: 'Ошибка получения категорий: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    const body = await request.json();

    // Validate category data
    const errors = validateCategory(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const newCategory = new Category({
      name: body.name,
      description: body.description || '',
      subcategories: Array.isArray(body.subcategories)
        ? body.subcategories
        : [],
      parentCategory: body.parentCategory || undefined,
      parameters:
        typeof body.parameters === 'object' && body.parameters !== null
          ? body.parameters
          : {},
    });

    const savedCategory = await newCategory.save();
    return NextResponse.json(savedCategory, { status: 201 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[API_CATEGORIES_POST]', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: 'Категория с таким названием уже существует.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка создания категории: ' + errorMessage },
      { status: 500 }
    );
  }
}
