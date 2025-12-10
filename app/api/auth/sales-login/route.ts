import { getDatabase } from '@/lib/mongodb';
import SalesStaff from '@/models/SalesStaff';

import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

/**
 * @swagger
 * /auth/sales-login:
 *   post:
 *     tags: [Authentication]
 *     summary: Аутентификация сотрудника продаж
 *     description: Авторизация сотрудника отдела продаж
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Логин сотрудника
 *                 example: "ivanov"
 *               password:
 *                 type: string
 *                 description: Пароль сотрудника
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: Логин сотрудника
 *                 fullName:
 *                   type: string
 *                   description: Полное имя сотрудника
 *       400:
 *         description: Отсутствуют обязательные поля
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неверные учетные данные
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
export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find sales staff member
    const staff = await SalesStaff.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, staff.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    staff.lastLogin = new Date();
    await staff.save();

    return NextResponse.json({
      username: staff.username,
      fullName: staff.fullName,
    });
  } catch (error) {
    console.error('Sales login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}