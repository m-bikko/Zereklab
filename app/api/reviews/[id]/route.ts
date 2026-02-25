import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';

import { NextRequest, NextResponse } from 'next/server';

// PUT - Update review status (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Некорректный статус. Используйте "approved" или "rejected"' },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndUpdate(
      id,
      {
        status,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!review) {
      return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 });
    }

    return NextResponse.json({
      message: status === 'approved' ? 'Отзыв одобрен' : 'Отзыв отклонён',
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении отзыва' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB;

    const { id } = await params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Отзыв удалён',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении отзыва' },
      { status: 500 }
    );
  }
}
