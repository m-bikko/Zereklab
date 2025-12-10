import { getDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

import { NextRequest, NextResponse } from 'next/server';

import mongoose from 'mongoose';

/**
 * @swagger
 * /blog/{slug}:
 *   get:
 *     tags: [Blog]
 *     summary: Получение статьи по slug
 *     description: Получение детальной информации о статье блога
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор статьи
 *         example: "arduino-dlya-detey"
 *       - in: query
 *         name: incrementViews
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Увеличивать ли счетчик просмотров
 *     responses:
 *       200:
 *         description: Статья найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
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
 *   put:
 *     tags: [Blog]
 *     summary: Обновление статьи
 *     description: Обновление существующей статьи блога
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор статьи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: Статья успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Blog post updated successfully"
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Статья не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Конфликт с существующим slug
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
 *   delete:
 *     tags: [Blog]
 *     summary: Удаление статьи
 *     description: Удаление статьи из блога
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор статьи
 *     responses:
 *       200:
 *         description: Статья успешно удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Blog post deleted successfully"
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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await getDatabase();
    const { searchParams } = new URL(request.url);
    const incrementViews = searchParams.get('incrementViews') !== 'false';

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

    // Увеличиваем счетчик просмотров, если запрошено
    if (incrementViews) {
      await blog.incrementViews();
    }

    // Получаем связанные статьи
    let relatedPosts: unknown[] = [];
    if (blog.relatedPosts && blog.relatedPosts.length > 0) {
      relatedPosts = await Blog.find({
        _id: { $in: blog.relatedPosts },
        isPublished: true
      })
      .select('title slug excerpt previewImage publishedAt readingTime')
      .lean();
    }

    // Если связанных статей нет, найдем похожие по тегам
    if (relatedPosts.length === 0 && blog.tags && blog.tags.length > 0) {
      relatedPosts = await Blog.find({
        _id: { $ne: blog._id },
        tags: { $in: blog.tags },
        isPublished: true
      })
      .select('title slug excerpt previewImage publishedAt readingTime')
      .limit(3)
      .lean();
    }

    return NextResponse.json({
      ...blog.toObject(),
      relatedPosts
    });
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await getDatabase();
    const body = await request.json();

    const blog = await Blog.findOne({ slug: params.slug });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Проверка уникальности нового slug (если изменился)
    if (body.slug && body.slug !== params.slug) {
      const existingBlog = await Blog.findOne({ slug: body.slug });
      if (existingBlog) {
        return NextResponse.json(
          { error: 'Blog post with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Обновление полей
    Object.keys(body).forEach(key => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        (blog as Record<string, unknown>)[key] = body[key];
      }
    });

    // Пересчет времени чтения если изменился контент
    if (body.content) {
      blog.calculateReadingTime('ru');
    }

    const updatedBlog = await blog.save();

    return NextResponse.json({
      message: 'Blog post updated successfully',
      blog: updatedBlog,
    });
  } catch (error: unknown) {
    console.error('Failed to update blog post:', error);

    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await getDatabase();

    const deletedBlog = await Blog.findOneAndDelete({ slug: params.slug });

    if (!deletedBlog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Blog post deleted successfully',
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to delete blog post:', error);

    return NextResponse.json(
      { error: 'Failed to delete blog post: ' + errorMessage },
      { status: 500 }
    );
  }
}