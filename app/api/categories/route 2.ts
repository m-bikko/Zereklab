import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import Category, { validateCategory, ICategory } from '@/models/Category';

export async function GET(request: Request) {
  try {
    await getDatabase();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('[API_CATEGORIES_GET]', error);
    return new NextResponse(`Ошибка получения категорий: ${error.message || 'Внутренняя ошибка сервера'}`, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await getDatabase();
    const body = await request.json();
    const validationErrors = validateCategory(body);
    if (validationErrors.length > 0) {
      return new NextResponse(JSON.stringify({ message: 'Ошибка валидации', errors: validationErrors }), { status: 400 });
    }

    const newCategory = new Category(body);
    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('[API_CATEGORIES_POST]', error);
    if (error.code === 11000) { // Duplicate key error
        return new NextResponse('Категория с таким названием уже существует.', { status: 409 });
    }
    return new NextResponse(`Ошибка создания категории: ${error.message || 'Внутренняя ошибка сервера'}`, { status: 500 });
  }
} 