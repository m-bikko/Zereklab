import { getDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';

import { NextRequest, NextResponse } from 'next/server';

import mongoose from 'mongoose';

// Интерфейс для мультиязычного текста
interface MultilingualText {
  ru?: string;
  kk?: string;
  en?: string;
}

// Интерфейс для данных категории
interface CategoryData {
  name?: MultilingualText;
  description?: MultilingualText;
  [key: string]: unknown;
}

// Валидация мультиязычного текста
const validateMultilingualText = (text: unknown, fieldName: string): string[] => {
  const errors: string[] = [];
  if (!text || typeof text !== 'object') {
    errors.push(`${fieldName} должно быть объектом с переводами`);
    return errors;
  }

  const multiText = text as MultilingualText;
  if (!multiText.ru?.trim())
    errors.push(`${fieldName} на русском языке обязательно`);
  if (!multiText.kk?.trim())
    errors.push(`${fieldName} на казахском языке обязательно`);
  if (!multiText.en?.trim())
    errors.push(`${fieldName} на английском языке обязательно`);

  return errors;
};

// Валидация категории
const validateCategory = (category: CategoryData): string[] => {
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await Category.findById(params.id).lean();

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getDatabase();
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Validate category data
    const errors = validateCategory(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const updateData = body;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedCategory = await Category.findByIdAndUpdate(
      params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCategory);
  } catch (error: unknown) {
    console.error('Failed to update category:', error);

    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err: Error) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

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
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(params.id);

    if (!deletedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Category deleted successfully',
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to delete category:', error);

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete category: ' + errorMessage },
      { status: 500 }
    );
  }
}
