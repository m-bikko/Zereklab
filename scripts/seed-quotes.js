const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zereklab';

const QuoteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'quotes',
  }
);

const Quote = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);

const defaultQuotes = [
  {
    text: 'Образование — это самое мощное оружие, которое вы можете использовать, чтобы изменить мир.',
    author: 'Нельсон Мандела',
    isActive: true,
  },
  {
    text: 'Скажи мне — и я забуду, покажи мне — и я запомню, дай мне сделать — и я пойму.',
    author: 'Конфуций',
    isActive: true,
  },
  {
    text: 'Будущее принадлежит тем, кто верит в красоту своих мечтаний.',
    author: 'Элеонора Рузвельт',
    isActive: true,
  },
  {
    text: 'Единственный способ делать великую работу — это любить то, что ты делаешь.',
    author: 'Стив Джобс',
    isActive: true,
  },
  {
    text: 'Каждый ребенок — художник. Проблема в том, как остаться художником, когда вырастешь.',
    author: 'Пабло Пикассо',
    isActive: true,
  },
  {
    text: 'Не бойтесь расти медленно, бойтесь остаться на месте.',
    author: 'Китайская пословица',
    isActive: true,
  },
  {
    text: 'Творчество — это интеллект, который веселится.',
    author: 'Альберт Эйнштейн',
    isActive: true,
  },
  {
    text: 'Лучший способ предсказать будущее — это создать его.',
    author: 'Питер Друкер',
    isActive: true,
  },
  {
    text: 'Знание — сила, но только применение знаний дает результаты.',
    author: 'Френсис Бэкон',
    isActive: true,
  },
  {
    text: 'Обучение — это открытие того, что ты уже знаешь. Действие — это демонстрация того, что ты знаешь.',
    author: 'Ричард Бах',
    isActive: true,
  },
];

async function seedQuotes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if quotes already exist
    const existingQuotes = await Quote.countDocuments();
    
    if (existingQuotes > 0) {
      console.log(`📝 Found ${existingQuotes} existing quotes. Skipping seeding.`);
      process.exit(0);
    }

    // Insert default quotes
    const result = await Quote.insertMany(defaultQuotes);
    console.log(`✅ Successfully seeded ${result.length} quotes to database`);
    
    console.log('📋 Seeded quotes:');
    result.forEach((quote, index) => {
      console.log(`${index + 1}. "${quote.text.substring(0, 50)}..." - ${quote.author}`);
    });

  } catch (error) {
    console.error('❌ Error seeding quotes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
if (require.main === module) {
  seedQuotes();
}

module.exports = { seedQuotes, defaultQuotes };