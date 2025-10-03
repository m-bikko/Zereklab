import { getDatabase } from '@/lib/mongodb';
import Bonus from '@/models/Bonus';
import Product from '@/models/Product';
import Sale from '@/models/Sale';

import { NextRequest, NextResponse } from 'next/server';

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
    if (phone && phone.trim()) {
      // Properly escape regex special characters in phone numbers
      const escapedPhone = phone.trim().replace(/[+\-()\\s]/g, '\\$&');
      filter.customerPhone = { $regex: escapedPhone, $options: 'i' };
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
      limit
    });
    return NextResponse.json(
      { error: 'Failed to fetch sales', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Create new sale
export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { customerPhone, items } = body;

    // Validate input
    if (!customerPhone || !items || !Array.isArray(items) || items.length === 0) {
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
      if (!product.inStock || (product.stockQuantity && product.stockQuantity < quantity)) {
        const productName = typeof product.name === 'string' ? product.name : product.name.ru;
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
        productName: typeof product.name === 'string' ? product.name : product.name.ru,
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

    // Calculate bonuses (5%)
    const bonusesEarned = Math.floor(totalAmount * 0.05);

    // Create sale record
    const sale = new Sale({
      customerPhone,
      items: processedItems,
      totalAmount,
      bonusesEarned,
    });

    await sale.save();

    // Add bonuses to customer account
    let bonus = await Bonus.findOne({ phoneNumber: customerPhone });
    if (!bonus) {
      bonus = new Bonus({
        phoneNumber: customerPhone,
        totalBonuses: bonusesEarned,
        usedBonuses: 0,
        availableBonuses: bonusesEarned,
      });
    } else {
      bonus.totalBonuses += bonusesEarned;
      bonus.availableBonuses = bonus.totalBonuses - bonus.usedBonuses;
    }
    await bonus.save();

    return NextResponse.json({
      sale: {
        _id: sale._id,
        customerPhone: sale.customerPhone,
        items: sale.items,
        totalAmount: sale.totalAmount,
        bonusesEarned: sale.bonusesEarned,
        saleDate: sale.saleDate,
      },
      customerBonuses: {
        availableBonuses: bonus.availableBonuses,
        totalBonuses: bonus.totalBonuses,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create sale:', error);
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    );
  }
}