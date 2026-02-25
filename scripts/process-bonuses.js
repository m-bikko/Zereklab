const { getDatabase } = require('../lib/mongodb');
const PendingBonus = require('../models/PendingBonus');
const Bonus = require('../models/Bonus');
const Sale = require('../models/Sale');

async function processBonuses() {
  try {
    await getDatabase();
    console.log('Starting bonus processing...');

    const now = new Date();

    // Find all pending bonuses that should be processed
    const readyBonuses = await PendingBonus.find({
      availableDate: { $lte: now },
      isProcessed: false,
    }).lean();

    if (readyBonuses.length === 0) {
      console.log('No bonuses ready for processing');
      return;
    }

    console.log(`Found ${readyBonuses.length} bonuses ready for processing`);
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
            totalBonuses: pendingBonus.bonusAmount,
            usedBonuses: 0,
            availableBonuses: pendingBonus.bonusAmount,
          });
        } else {
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
        await PendingBonus.findByIdAndUpdate(pendingBonus._id, {
          isProcessed: true,
        });

        processedBonuses.push({
          phoneNumber: pendingBonus.phoneNumber,
          bonusAmount: pendingBonus.bonusAmount,
          saleId: pendingBonus.saleId,
        });

        console.log(
          `Processed bonus for ${pendingBonus.phoneNumber}: ${pendingBonus.bonusAmount} bonuses`
        );
      } catch (error) {
        console.error(
          `Failed to process bonus for ${pendingBonus.phoneNumber}:`,
          error
        );
        continue;
      }
    }

    console.log(`Successfully processed ${processedBonuses.length} bonuses`);
    console.log('Bonus processing completed');
  } catch (error) {
    console.error('Failed to process bonuses:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  processBonuses()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { processBonuses };
