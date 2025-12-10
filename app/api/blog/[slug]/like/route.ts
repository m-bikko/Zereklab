import { getDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /blog/{slug}/like:
 *   post:
 *     tags: [Blog]
 *     summary: Лайк статьи
 *     description: Увеличение счетчика лайков для статьи
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор статьи
 *     responses:
 *       200:
 *         description: Лайк успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Like added successfully"
 *                 likes:
 *                   type: number
 *                   description: Новое количество лайков
 *       404:
 *         description: Статья не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await getDatabase();

    const blog = await Blog.findOne({ 
      slug: params.slug,
      isPublished: true 
    });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Увеличиваем количество лайков
    blog.likes += 1;
    await blog.save();

    return NextResponse.json({
      message: 'Like added successfully',
      likes: blog.likes,
    });
  } catch (error) {
    console.error('Failed to like blog post:', error);
    return NextResponse.json(
      { error: 'Failed to like blog post' },
      { status: 500 }
    );
  }
}