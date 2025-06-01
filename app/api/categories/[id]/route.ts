import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
import mongoose from 'mongoose';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: 'Неверный ID категории.' }, { status: 400 });
  }

  try {
    await getDatabase();
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: 'Категория не найдена.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error: any) {
    console.error(`[API_CATEGORIES_ID_GET] ID: ${id}`, error);
    return NextResponse.json({ success: false, message: 'Ошибка получения категории: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: 'Неверный ID категории.' }, { status: 400 });
  }

  try {
    await getDatabase();
    const body = await request.json();

    // Basic validation
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      return NextResponse.json({ success: false, message: 'Название категории не может быть пустым.' }, { status: 400 });
    }
    
    // Prepare update data to avoid overwriting fields with undefined
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.subcategories !== undefined) updateData.subcategories = Array.isArray(body.subcategories) ? body.subcategories : [];
    if (body.parameters !== undefined) updateData.parameters = typeof body.parameters === 'object' && body.parameters !== null ? body.parameters : {};


    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ success: false, message: 'Категория не найдена для обновления.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedCategory }, { status: 200 });
  } catch (error: any) {
    console.error(`[API_CATEGORIES_ID_PUT] ID: ${id}`, error);
     if (error.code === 11000) {
        return NextResponse.json({ success: false, message: 'Категория с таким названием уже существует.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Ошибка обновления категории: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: 'Неверный ID категории.' }, { status: 400 });
  }

  try {
    await getDatabase();
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ success: false, message: 'Категория не найдена для удаления.' }, { status: 404 });
    }
    // TODO: Consider what to do with products that belong to this category.
    // For now, we'll just delete the category.
    return NextResponse.json({ success: true, message: 'Категория успешно удалена.' }, { status: 200 });
  } catch (error: any) {
    console.error(`[API_CATEGORIES_ID_DELETE] ID: ${id}`, error);
    return NextResponse.json({ success: false, message: 'Ошибка удаления категории: ' + error.message }, { status: 500 });
  }
} 