import { getDatabase } from '@/lib/mongodb';
import Contact from '@/models/Contact';

import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

// Interface for query filters
interface ContactQuery {
  status?: 'new' | 'read' | 'replied';
}

// Validation schema for contact form
const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid WhatsApp number (e.g., +77753084648)')
    .min(10, 'WhatsApp number must be at least 10 digits')
    .max(16, 'WhatsApp number cannot exceed 16 characters')
    .trim(),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject cannot exceed 200 characters')
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message cannot exceed 2000 characters')
    .trim(),
});

/**
 * @swagger
 * /contact:
 *   get:
 *     tags: [Contact]
 *     summary: Получение обращений
 *     description: Получение списка обращений от клиентов
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, read, replied]
 *         description: Фильтр по статусу обращения
 *     responses:
 *       200:
 *         description: Список обращений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags: [Contact]
 *     summary: Отправка обращения
 *     description: Отправка нового обращения от клиента
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - whatsapp
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Имя отправителя
 *                 example: "Алия Казыбаева"
 *               whatsapp:
 *                 type: string
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *                 minLength: 10
 *                 maxLength: 16
 *                 description: Номер WhatsApp
 *                 example: "+77753084648"
 *               subject:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Тема обращения
 *                 example: "Вопрос по доставке"
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Текст сообщения
 *                 example: "Когда будет доставлен заказ?"
 *     responses:
 *       200:
 *         description: Обращение успешно отправлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Обращение успешно отправлено"
 *                 contact:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Ошибка валидации
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
// POST - Create new contact submission
export async function POST(request: NextRequest) {
  console.log('🔥 Contact API POST called');
  
  try {
    console.log('📡 Connecting to database...');
    await getDatabase();
    console.log('✅ Database connected successfully');

    console.log('📝 Parsing request body...');
    const body = await request.json();
    console.log('📋 Request body:', body);

    // Validate request body
    console.log('🔍 Validating request data...');
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    console.log('✅ Validation passed');

    const { name, whatsapp, subject, message } = validationResult.data;

    // Check for spam (basic rate limiting by WhatsApp number)
    console.log('🚫 Checking for recent submissions...');
    const recentSubmission = await Contact.findOne({
      whatsapp,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // 5 minutes
    });

    if (recentSubmission) {
      console.log('⏰ Rate limit hit for WhatsApp:', whatsapp);
      return NextResponse.json(
        {
          error: 'Too many submissions. Please wait before sending another message.',
        },
        { status: 429 }
      );
    }
    console.log('✅ No recent submissions found');

    // Create new contact submission
    console.log('💾 Creating new contact submission...');
    const contact = new Contact({
      name,
      whatsapp,
      subject,
      message,
      status: 'new',
    });

    console.log('📤 Saving to database...');
    await contact.save();
    console.log('✅ Contact saved successfully:', contact._id);

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully!',
        data: {
          id: contact._id,
          name: contact.name,
          whatsapp: contact.whatsapp,
          subject: contact.subject,
          createdAt: contact.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : { message: 'Unknown error' };
    console.error('Error details:', errorDetails);
    return NextResponse.json(
      {
        error: 'Internal server error. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve contact submissions (for admin)
export async function GET(request: NextRequest) {
  try {
    await getDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Build query
    const query: ContactQuery = {};
    if (status && ['new', 'read', 'replied'].includes(status)) {
      query.status = status as 'new' | 'read' | 'replied';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get contacts with pagination
    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Contact.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch contact submissions',
      },
      { status: 500 }
    );
  }
}

// PUT - Update contact status (for admin)
export async function PUT(request: NextRequest) {
  try {
    await getDatabase();

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Contact ID and status are required' },
        { status: 400 }
      );
    }

    if (!['new', 'read', 'replied'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: new, read, or replied' },
        { status: 400 }
      );
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      {
        error: 'Failed to update contact status',
      },
      { status: 500 }
    );
  }
} 