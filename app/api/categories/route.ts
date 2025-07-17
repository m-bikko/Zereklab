import { getDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';

import { NextRequest, NextResponse } from 'next/server';

// Валидация мультиязычного текста
const validateMultilingualText = (text: any, fieldName: string): string[] => {
  const errors: string[] = [];
  if (!text || typeof text !== 'object') {
    errors.push(`${fieldName} должно быть объектом с переводами`);
    return errors;
  }

  if (!text.ru?.trim())
    errors.push(`${fieldName} на русском языке обязательно`);
  if (!text.kk?.trim())
    errors.push(`${fieldName} на казахском языке обязательно`);
  if (!text.en?.trim())
    errors.push(`${fieldName} на английском языке обязательно`);

  return errors;
};

// Валидация категории
const validateCategory = (category: any): string[] => {
  const errors: string[] = [];

  // Валидация названия (обязательно)
  errors.push(...validateMultilingualText(category.name, 'Название'));

  // Валидация описания (опционально, но если есть - должно быть корректным)
  if (category.description && typeof category.description === 'object') {
    const descErrors = validateMultilingualText(
      category.description,
      'Описание'
    );
    // Для описания не требуем все языки, но если есть - должны быть корректными
    if (
      category.description.ru ||
      category.description.kk ||
      category.description.en
    ) {
      errors.push(...descErrors);
    }
  }

  return errors;
};

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
      description: body.description || undefined,
      subcategories: Array.isArray(body.subcategories)
        ? body.subcategories
        : [],
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
