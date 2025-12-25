import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';

export const dynamic = 'force-dynamic';

// GET - Admin endpoint to fetch all reviews with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', or null for all
    const skip = (page - 1) * limit;

    const filter: { status?: string } = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const [reviews, total, pendingCount] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      Review.countDocuments({ status: 'pending' })
    ]);

    return NextResponse.json({
      reviews,
      pendingCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + reviews.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching reviews for admin:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке отзывов' },
      { status: 500 }
    );
  }
}
