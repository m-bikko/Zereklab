import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';

export const dynamic = 'force-dynamic';

// GET - Public endpoint to fetch approved reviews with pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '3');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ status: 'approved' })
        .select('content createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ status: 'approved' })
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + reviews.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке отзывов' },
      { status: 500 }
    );
  }
}

// POST - Create new review (status: pending)
export async function POST(request: NextRequest) {
  try {
    await connectDB;

    const body = await request.json();
    const { phone, content } = body;

    if (!phone || !content) {
      return NextResponse.json(
        { error: 'Номер телефона и текст отзыва обязательны' },
        { status: 400 }
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: 'Отзыв должен содержать минимум 10 символов' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Отзыв не должен превышать 1000 символов' },
        { status: 400 }
      );
    }

    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Некорректный формат номера телефона' },
        { status: 400 }
      );
    }

    const review = await Review.create({
      phone: phone.trim(),
      content: content.trim(),
      status: 'pending'
    });

    return NextResponse.json({
      message: 'Отзыв успешно отправлен и ожидает модерации',
      reviewId: review._id
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании отзыва' },
      { status: 500 }
    );
  }
}
