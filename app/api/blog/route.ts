import { getDatabase } from '@/lib/mongodb';
import Blog, { IBlog } from '@/models/Blog';

import { NextRequest, NextResponse } from 'next/server';

import mongoose, { FilterQuery, SortOrder } from 'mongoose';

/**
 * @swagger
 * /blog:
 *   get:
 *     tags: [Blog]
 *     summary: Получение списка статей блога
 *     description: Получение списка статей с фильтрацией, поиском и пагинацией
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Количество статей на странице
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поисковый запрос по заголовку и содержанию
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Фильтр по тегам (через запятую)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [publishedAt, views, likes, createdAt]
 *           default: publishedAt
 *         description: Поле для сортировки
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Порядок сортировки
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Только рекомендуемые статьи
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Только опубликованные статьи
 *     responses:
 *       200:
 *         description: Список статей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     totalBlogs:
 *                       type: number
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *                     limit:
 *                       type: number
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags: [Blog]
 *     summary: Создание новой статьи блога
 *     description: Добавление новой статьи в блог (только для администраторов)
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       201:
 *         description: Статья успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Статья с таким slug уже существует
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

export async function GET(request: NextRequest) {
  try {
    await getDatabase();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tags = searchParams.get('tags');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const featured = searchParams.get('featured');
    const published = searchParams.get('published') !== 'false'; // По умолчанию только опубликованные

    // Build filter object
    const filter: FilterQuery<IBlog> = {};

    // Фильтр по статусу публикации
    if (published) {
      filter.isPublished = true;
    }

    // Фильтр по рекомендуемым
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Фильтр по категории
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Фильтр по тегам
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagList };
    }

    // Поиск по заголовку и содержанию
    if (search) {
      filter.$or = [
        { 'title.ru': { $regex: search, $options: 'i' } },
        { 'title.kk': { $regex: search, $options: 'i' } },
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'excerpt.ru': { $regex: search, $options: 'i' } },
        { 'excerpt.kk': { $regex: search, $options: 'i' } },
        { 'excerpt.en': { $regex: search, $options: 'i' } },
        { 'content.ru': { $regex: search, $options: 'i' } },
        { 'content.kk': { $regex: search, $options: 'i' } },
        { 'content.en': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Сортировка
    const sort: Record<string, SortOrder> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Пагинация
    const skip = (page - 1) * limit;

    // Выполнение запроса
    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs: total,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    const body = await request.json();

    // Валидация обязательных полей
    if (!body.title?.ru || !body.title?.kk || !body.title?.en) {
      return NextResponse.json(
        { error: 'Заголовок на всех языках обязателен' },
        { status: 400 }
      );
    }

    if (!body.slug) {
      return NextResponse.json(
        { error: 'Slug обязателен' },
        { status: 400 }
      );
    }

    if (!body.excerpt?.ru || !body.excerpt?.kk || !body.excerpt?.en) {
      return NextResponse.json(
        { error: 'Краткое описание на всех языках обязательно' },
        { status: 400 }
      );
    }

    if (!body.content?.ru || !body.content?.kk || !body.content?.en) {
      return NextResponse.json(
        { error: 'Содержание на всех языках обязательно' },
        { status: 400 }
      );
    }

    if (!body.previewImage) {
      return NextResponse.json(
        { error: 'Превью изображение обязательно' },
        { status: 400 }
      );
    }

    // Проверка уникальности slug
    const existingBlog = await Blog.findOne({ slug: body.slug });
    if (existingBlog) {
      return NextResponse.json(
        { error: 'Статья с таким slug уже существует' },
        { status: 409 }
      );
    }

    // Создание новой статьи
    const blog = new Blog(body);

    // Подсчет времени чтения
    blog.calculateReadingTime('ru');

    const savedBlog = await blog.save();

    return NextResponse.json(savedBlog, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to create blog:', error);

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

    // Handle duplicate key errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: 'Статья с таким slug уже существует' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}