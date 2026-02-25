import { getDatabase } from '@/lib/mongodb';
import { extractPhoneDigits } from '@/lib/phoneUtils';
import Bonus from '@/models/Bonus';
import PendingBonus from '@/models/PendingBonus';
import Product from '@/models/Product';
import Sale from '@/models/Sale';

import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /sales:
 *   get:
 *     tags: [Sales]
 *     summary: Получение списка продаж
 *     description: Получение списка всех продаж с пагинацией и фильтрацией
 *     security:
 *       - SalesAuth: []
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
 *           default: 20
 *         description: Количество продаж на странице
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Фильтр по номеру телефона клиента
 *     responses:
 *       200:
 *         description: Список продаж
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sales:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     totalSales:
 *                       type: number
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags: [Sales]
 *     summary: Создание новой продажи
 *     description: Регистрация новой продажи с обработкой бонусов
 *     security:
 *       - SalesAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sale'
 *     responses:
 *       200:
 *         description: Продажа успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Ошибка в данных запроса
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
// Get all sales with pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const phone = searchParams.get('phone');

  try {
    await getDatabase();

    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    let salesList;
    if (phone && phone.trim()) {
      // Search by phone digits to ignore formatting
      const searchDigits = extractPhoneDigits(phone.trim());
      const allSales = await Sale.find({}).lean();
      const matchingSales = allSales.filter(
        sale => extractPhoneDigits(sale.customerPhone) === searchDigits
      );

      // Apply pagination to filtered results
      const startIndex = skip;
      const endIndex = skip + limit;
      salesList = matchingSales.slice(startIndex, endIndex);

      // Calculate total for pagination
      const total = matchingSales.length;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        sales: salesList,
        pagination: {
          currentPage: page,
          totalPages,
          totalSales: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }

    // Get sales with pagination
    const sales = await Sale.find(filter)
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Sale.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      sales,
      pagination: {
        currentPage: page,
        totalPages,
        totalSales: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      phone,
      page,
      limit,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch sales',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Create new sale
export async function POST(request: NextRequest) {
  try {
    await getDatabase();

    const body = await request.json();
    const { customerPhone, customerFullName, items } = body;

    // Validate input
    if (
      !customerPhone ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Customer phone and items are required' },
        { status: 400 }
      );
    }

    // Validate phone format
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(customerPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +7 (777) 123-12-12' },
        { status: 400 }
      );
    }

    // Validate and process items
    const processedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json(
          { error: 'Each item must have productId and positive quantity' },
          { status: 400 }
        );
      }

      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${productId} not found` },
          { status: 404 }
        );
      }

      // Check stock
      if (
        !product.inStock ||
        (product.stockQuantity && product.stockQuantity < quantity)
      ) {
        const productName =
          typeof product.name === 'string' ? product.name : product.name.ru;
        return NextResponse.json(
          { error: `Insufficient stock for product ${productName}` },
          { status: 400 }
        );
      }

      // Calculate prices
      const unitPrice = product.salePrice || product.price;
      const itemTotalPrice = unitPrice * quantity;
      totalAmount += itemTotalPrice;

      processedItems.push({
        productId: String(product._id),
        productName:
          typeof product.name === 'string' ? product.name : product.name.ru,
        price: product.price,
        salePrice: product.salePrice,
        quantity,
        totalPrice: itemTotalPrice,
      });

      // Update stock
      if (product.stockQuantity !== undefined) {
        product.stockQuantity -= quantity;
        if (product.stockQuantity === 0) {
          product.inStock = false;
        }
        await product.save();
      }
    }

    // Calculate bonuses (3%)
    const bonusesEarned = Math.floor(totalAmount * 0.03);

    // Create sale record
    const sale = new Sale({
      customerPhone,
      customerFullName: customerFullName?.trim() || undefined,
      items: processedItems,
      totalAmount,
      bonusesEarned,
    });

    await sale.save();

    // Create pending bonus record (will be credited after 10 days)
    const pendingBonus = new PendingBonus({
      phoneNumber: customerPhone,
      fullName: customerFullName?.trim() || undefined,
      saleId: String(sale._id),
      bonusAmount: bonusesEarned,
      availableDate: sale.bonusAvailableDate,
    });

    await pendingBonus.save();

    // Don't immediately add bonuses to customer account anymore
    // Bonuses will be added after 10 days through the automatic system

    // Get current bonus status
    const currentBonus = await Bonus.findOne({ phoneNumber: customerPhone });

    return NextResponse.json(
      {
        sale: {
          _id: sale._id,
          customerPhone: sale.customerPhone,
          items: sale.items,
          totalAmount: sale.totalAmount,
          bonusesEarned: sale.bonusesEarned,
          bonusStatus: sale.bonusStatus,
          bonusAvailableDate: sale.bonusAvailableDate,
          saleDate: sale.saleDate,
        },
        customerBonuses: {
          availableBonuses: currentBonus?.availableBonuses || 0,
          totalBonuses: currentBonus?.totalBonuses || 0,
        },
        pendingBonuses: {
          amount: bonusesEarned,
          availableDate: sale.bonusAvailableDate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create sale:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to create sale',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
