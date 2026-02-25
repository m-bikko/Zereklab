import { getDatabase } from '@/lib/mongodb';
import Bonus from '@/models/Bonus';
import PendingBonus from '@/models/PendingBonus';
import Sale from '@/models/Sale';

import { NextResponse } from 'next/server';

// Process pending bonuses that are ready to be credited
export async function POST() {
  try {
    await getDatabase();

    const now = new Date();

    // Find all pending bonuses that should be processed
    const readyBonuses = await PendingBonus.find({
      availableDate: { $lte: now },
      isProcessed: false,
    });

    if (readyBonuses.length === 0) {
      return NextResponse.json({
        message: 'No bonuses ready for processing',
        processedCount: 0,
      });
    }

    const processedBonuses = [];

    for (const pendingBonus of readyBonuses) {
      try {
        // Find or create bonus record for customer
        let customerBonus = await Bonus.findOne({
          phoneNumber: pendingBonus.phoneNumber,
        });

        if (!customerBonus) {
          customerBonus = new Bonus({
            phoneNumber: pendingBonus.phoneNumber,
            fullName: pendingBonus.fullName,
            totalBonuses: pendingBonus.bonusAmount,
            usedBonuses: 0,
            availableBonuses: pendingBonus.bonusAmount,
          });
        } else {
          // Update full name if it's provided and not already set
          if (pendingBonus.fullName && !customerBonus.fullName) {
            customerBonus.fullName = pendingBonus.fullName;
          }
          customerBonus.totalBonuses += pendingBonus.bonusAmount;
          customerBonus.availableBonuses =
            customerBonus.totalBonuses - customerBonus.usedBonuses;
        }

        await customerBonus.save();

        // Update sale status
        await Sale.findByIdAndUpdate(pendingBonus.saleId, {
          bonusStatus: 'credited',
        });

        // Mark pending bonus as processed
        pendingBonus.isProcessed = true;
        await pendingBonus.save();

        processedBonuses.push({
          phoneNumber: pendingBonus.phoneNumber,
          bonusAmount: pendingBonus.bonusAmount,
          saleId: pendingBonus.saleId,
        });
      } catch (error) {
        console.error(
          `Failed to process bonus for ${pendingBonus.phoneNumber}:`,
          error
        );
        continue;
      }
    }

    return NextResponse.json({
      message: `Processed ${processedBonuses.length} bonuses`,
      processedCount: processedBonuses.length,
      processedBonuses,
    });
  } catch (error) {
    console.error('Failed to process bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to process bonuses' },
      { status: 500 }
    );
  }
}

// Get processing statistics and pending customers list
export async function GET() {
  try {
    await getDatabase();

    const now = new Date();

    const stats = await PendingBonus.aggregate([
      {
        $group: {
          _id: null,
          totalPending: {
            $sum: {
              $cond: [{ $eq: ['$isProcessed', false] }, 1, 0],
            },
          },
          totalProcessed: {
            $sum: {
              $cond: [{ $eq: ['$isProcessed', true] }, 1, 0],
            },
          },
          readyForProcessing: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isProcessed', false] },
                    { $lte: ['$availableDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalPendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$isProcessed', false] }, '$bonusAmount', 0],
            },
          },
          readyAmount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isProcessed', false] },
                    { $lte: ['$availableDate', now] },
                  ],
                },
                '$bonusAmount',
                0,
              ],
            },
          },
        },
      },
    ]);

    // Get pending customers grouped by phone number
    const pendingCustomers = await PendingBonus.aggregate([
      {
        $match: { isProcessed: false },
      },
      {
        $group: {
          _id: '$phoneNumber',
          fullName: { $first: '$fullName' },
          phoneNumber: { $first: '$phoneNumber' },
          totalBonuses: { $sum: '$bonusAmount' },
          totalPurchases: { $sum: 1 },
          bonuses: {
            $push: {
              saleId: '$saleId',
              bonusAmount: '$bonusAmount',
              availableDate: '$availableDate',
              isReady: { $lte: ['$availableDate', now] },
            },
          },
        },
      },
      {
        $sort: { totalBonuses: -1 },
      },
    ]);

    return NextResponse.json({
      stats: stats[0] || {
        totalPending: 0,
        totalProcessed: 0,
        readyForProcessing: 0,
        totalPendingAmount: 0,
        readyAmount: 0,
      },
      pendingCustomers,
    });
  } catch (error) {
    console.error('Failed to get bonus processing stats:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
