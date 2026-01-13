import { getDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /blog/popular:
 *   get:
 *     tags: [Blog]
 *     summary: Получение популярных статей
 *     description: Получение списка популярных статей по количеству просмотров и лайков
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 20
 *         description: Количество популярных статей
 *     responses:
 *       200:
 *         description: Список популярных статей
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

    // Автоматически публикуем запланированные посты
    await Blog.publishScheduledPosts();

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    // Обратная совместимость: показываем посты где status='published' ИЛИ (isPublished=true и status не установлен)
    const popularBlogs = await Blog.find({
      $or: [
        { status: 'published' },
        { isPublished: true, status: { $exists: false } },
        { isPublished: true, status: null }
      ]
    })
      .sort({ views: -1, likes: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(popularBlogs);
  } catch (error) {
    console.error('Failed to fetch popular blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular blogs' },
      { status: 500 }
    );
  }
}