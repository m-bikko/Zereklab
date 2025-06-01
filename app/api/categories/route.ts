import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import Category from '@/models/Category'; // Using the new Category model
import { ICategory as ICategoryInterface } from '@/models/Product'; // For type consistency if needed

export async function GET() {
  try {
    await getDatabase();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error: any) {
    console.error('[API_CATEGORIES_GET]', error);
    return NextResponse.json({ success: false, message: 'Ошибка получения категорий: ' + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await getDatabase();
    const body = await request.json();

    // Basic validation
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ success: false, message: 'Название категории обязательно и должно быть строкой.' }, { status: 400 });
    }

    const newCategory = new Category({
      name: body.name,
      description: body.description || '',
      subcategories: Array.isArray(body.subcategories) ? body.subcategories : [],
      parameters: typeof body.parameters === 'object' && body.parameters !== null ? body.parameters : {},
    });

    await newCategory.save();
    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error: any) {
    console.error('[API_CATEGORIES_POST]', error);
    if (error.code === 11000) { // Duplicate key error
        return NextResponse.json({ success: false, message: 'Категория с таким названием уже существует.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Ошибка создания категории: ' + error.message }, { status: 500 });
  }
} 