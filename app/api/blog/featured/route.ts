import { getDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /blog/featured:
 *   get:
 *     tags: [Blog]
 *     summary: Получение рекомендуемых статей
 *     description: Получение списка рекомендуемых статей для главной страницы
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *           maximum: 10
 *         description: Количество рекомендуемых статей
 *     responses:
 *       200:
 *         description: Список рекомендуемых статей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '3'), 10);

    const featuredBlogs = await Blog.find({ isPublished: true, isFeatured: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(featuredBlogs);
  } catch (error) {
    console.error('Failed to fetch featured blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured blogs' },
      { status: 500 }
    );
  }
}