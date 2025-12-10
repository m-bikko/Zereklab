const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define the Bonus schema (same as in your models)
const bonusSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  fullName: {
    type: String,
    trim: true,
    index: true,
  },
  totalBonuses: {
    type: Number,
    default: 0,
    min: 0,
  },
  usedBonuses: {
    type: Number,
    default: 0,
    min: 0,
  },
  availableBonuses: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Pre-save middleware to calculate available bonuses
bonusSchema.pre('save', function(next) {
  this.availableBonuses = this.totalBonuses - this.usedBonuses;
  this.lastUpdated = new Date();
  next();
});

const Bonus = mongoose.models.Bonus || mongoose.model('Bonus', bonusSchema);

async function addTestBonuses() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const testPhone = '+7 (777) 777-77-77';
    const bonusesToAdd = 2500; // Добавляем 2500 бонусов для тестирования

    console.log(`📋 Searching for existing bonus record for ${testPhone}...`);
    
    let bonus = await Bonus.findOne({ phoneNumber: testPhone });
    
    if (bonus) {
      console.log(`📝 Found existing record: ${bonus.totalBonuses} total, ${bonus.availableBonuses} available`);
      // Добавляем бонусы к существующей записи
      bonus.totalBonuses += bonusesToAdd;
      await bonus.save();
      console.log(`🎁 Added ${bonusesToAdd} bonuses to existing account`);
    } else {
      console.log('📝 No existing record found, creating new one...');
      // Создаем новую запись
      bonus = new Bonus({
        phoneNumber: testPhone,
        fullName: 'Тест Тестович',
        totalBonuses: bonusesToAdd,
        usedBonuses: 0,
      });
      await bonus.save();
      console.log(`🎁 Created new bonus account with ${bonusesToAdd} bonuses`);
    }

    console.log('📊 Final bonus status:');
    console.log(`   Phone: ${bonus.phoneNumber}`);
    console.log(`   Name: ${bonus.fullName || 'Не указано'}`);
    console.log(`   Total Bonuses: ${bonus.totalBonuses.toLocaleString()}`);
    console.log(`   Used Bonuses: ${bonus.usedBonuses.toLocaleString()}`);
    console.log(`   Available Bonuses: ${bonus.availableBonuses.toLocaleString()}`);
    console.log(`   Last Updated: ${bonus.lastUpdated}`);

    console.log('✅ Test bonuses added successfully!');
    console.log('🧪 You can now test the bonus functionality with phone: +77777777777');

  } catch (error) {
    console.error('❌ Error adding test bonuses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

addTestBonuses();