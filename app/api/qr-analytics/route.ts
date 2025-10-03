import { getDatabase } from '@/lib/mongodb';
import QRAnalytics from '@/models/QRAnalytics';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { qrCode, redirectUrl, userAgent, timestamp } = body;

    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';

    const analytics = new QRAnalytics({
      qrCode,
      redirectUrl,
      userAgent,
      ipAddress,
      timestamp: new Date(timestamp),
    });

    await analytics.save();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to record QR analytics:', error);
    return NextResponse.json(
      { error: 'Failed to record analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await getDatabase();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const qrCode = searchParams.get('qrCode');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (qrCode) {
      filter.qrCode = qrCode;
    }

    // Get total count
    const totalCount = await QRAnalytics.countDocuments(qrCode ? { qrCode } : {});

    // Get daily counts for the specified period
    const dailyCounts = await QRAnalytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          count: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Fill in missing dates with 0 counts
    const result = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingEntry = dailyCounts.find(
        entry => entry.date.toISOString().split('T')[0] === dateStr
      );
      
      result.push({
        date: dateStr,
        count: existingEntry ? Number(existingEntry.count) : 0,
      });
      
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      currentDate = nextDate;
    }

    return NextResponse.json({
      totalCount,
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      periodCount: dailyCounts.reduce((sum, entry) => sum + Number(entry.count), 0),
      dailyCounts: result,
      period: { days, startDate, endDate },
    });
  } catch (error) {
    console.error('Failed to fetch QR analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}