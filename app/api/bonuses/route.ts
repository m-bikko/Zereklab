import { getDatabase } from '@/lib/mongodb';
import { extractPhoneDigits } from '@/lib/phoneUtils';
import Bonus from '@/models/Bonus';

import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /bonuses:
 *   get:
 *     tags: [Bonuses]
 *     summary: Получение бонусов клиента
 *     description: Получение информации о бонусах клиента по номеру телефона или имени
 *     parameters:
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Номер телефона клиента
 *         example: "+7 (777) 123-12-12"
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Полное имя клиента
 *         example: "Иван Петров"
 *     responses:
 *       200:
 *         description: Информация о бонусах
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 phoneNumber:
 *                   type: string
 *                   description: Номер телефона
 *                 fullName:
 *                   type: string
 *                   description: Полное имя
 *                 availableBonuses:
 *                   type: number
 *                   description: Доступные бонусы
 *                 totalBonuses:
 *                   type: number
 *                   description: Общее количество бонусов
 *                 usedBonuses:
 *                   type: number
 *                   description: Использованные бонусы
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *                   description: Дата последнего обновления
 *       400:
 *         description: Ошибка в параметрах запроса
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Клиент не найден
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
 *   post:
 *     tags: [Bonuses]
 *     summary: Начисление бонусов
 *     description: Начисление бонусов на счет клиента
 *     security:
 *       - SalesAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - bonusesToAdd
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$'
 *                 description: Номер телефона в формате +7 (777) 123-12-12
 *                 example: "+7 (777) 123-12-12"
 *               bonusesToAdd:
 *                 type: number
 *                 minimum: 0
 *                 description: Количество бонусов для начисления
 *                 example: 100
 *     responses:
 *       200:
 *         description: Бонусы успешно начислены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 phoneNumber:
 *                   type: string
 *                   description: Номер телефона
 *                 availableBonuses:
 *                   type: number
 *                   description: Доступные бонусы
 *                 totalBonuses:
 *                   type: number
 *                   description: Общее количество бонусов
 *                 bonusesAdded:
 *                   type: number
 *                   description: Начислено бонусов
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
// Get bonus by phone number or full name
export async function GET(request: NextRequest) {
  try {
    await getDatabase();

    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');
    const fullName = searchParams.get('name');

    if (!phoneNumber && !fullName) {
      return NextResponse.json(
        { error: 'Phone number or full name is required' },
        { status: 400 }
      );
    }

    let bonus;

    if (phoneNumber) {
      // Extract digits from the search phone number
      const searchDigits = extractPhoneDigits(phoneNumber);

      // Find bonus by matching phone digits
      const allBonuses = await Bonus.find({}).lean();
      bonus = allBonuses.find(
        b => extractPhoneDigits(b.phoneNumber) === searchDigits
      );

      if (bonus) {
        // Convert back to mongoose document
        bonus = await Bonus.findById(bonus._id);
      }

      if (!bonus) {
        // Create new bonus record if doesn't exist
        // Use the original formatted phone number from the request
        bonus = new Bonus({
          phoneNumber,
          totalBonuses: 0,
          usedBonuses: 0,
          availableBonuses: 0,
        });
        await bonus.save();
      }
    } else if (fullName) {
      // Search by full name (case insensitive)
      bonus = await Bonus.findOne({
        fullName: { $regex: fullName.trim(), $options: 'i' },
      });

      if (!bonus) {
        return NextResponse.json(
          { error: 'Customer not found with this name' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      phoneNumber: bonus.phoneNumber,
      fullName: bonus.fullName,
      availableBonuses: bonus.availableBonuses,
      totalBonuses: bonus.totalBonuses,
      usedBonuses: bonus.usedBonuses,
      lastUpdated: bonus.lastUpdated,
    });
  } catch (error) {
    console.error('Failed to fetch bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bonuses' },
      { status: 500 }
    );
  }
}

// Add bonuses to customer account
export async function POST(request: NextRequest) {
  try {
    await getDatabase();

    const body = await request.json();
    const { phoneNumber, bonusesToAdd } = body;

    if (!phoneNumber || typeof bonusesToAdd !== 'number') {
      return NextResponse.json(
        { error: 'Phone number and bonusesToAdd are required' },
        { status: 400 }
      );
    }

    // Validate phone format
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +7 (777) 123-12-12' },
        { status: 400 }
      );
    }

    if (bonusesToAdd < 0) {
      return NextResponse.json(
        { error: 'Bonuses to add must be positive' },
        { status: 400 }
      );
    }

    let bonus = await Bonus.findOne({ phoneNumber });

    if (!bonus) {
      bonus = new Bonus({
        phoneNumber,
        totalBonuses: bonusesToAdd,
        usedBonuses: 0,
        availableBonuses: bonusesToAdd,
      });
    } else {
      bonus.totalBonuses += bonusesToAdd;
      bonus.availableBonuses = bonus.totalBonuses - bonus.usedBonuses;
    }

    await bonus.save();

    return NextResponse.json({
      phoneNumber: bonus.phoneNumber,
      availableBonuses: bonus.availableBonuses,
      totalBonuses: bonus.totalBonuses,
      bonusesAdded: bonusesToAdd,
    });
  } catch (error) {
    console.error('Failed to add bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to add bonuses' },
      { status: 500 }
    );
  }
}
