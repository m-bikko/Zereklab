const { MongoClient } = require('mongodb');

// Database connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/zereklab';

// Normalize age range function (same as in lib/ageUtils.ts)
function normalizeAgeRange(ageRange) {
  if (!ageRange) return '';

  // Remove any extra whitespace and convert to lowercase for processing
  const cleaned = ageRange.trim().toLowerCase();

  // Handle pure numbers (convert to 13+ if >= 13)
  const numberMatch = cleaned.match(/^(\d+)$/);
  if (numberMatch) {
    const age = parseInt(numberMatch[1]);
    if (age >= 13) return '13+';
    if (age >= 9) return '9-12';
    if (age >= 6) return '6-8';
    return ageRange; // Keep original if below 6
  }

  // Handle ranges like "14+" or "20+"
  const plusMatch = cleaned.match(/^(\d+)\+/);
  if (plusMatch) {
    const age = parseInt(plusMatch[1]);
    if (age >= 13) return '13+';
    return ageRange; // Keep original if below 13
  }

  // Handle ranges like "6-8", "9-12", etc.
  const rangeMatch = cleaned.match(/^(\d+)-(\d+)/);
  if (rangeMatch) {
    const startAge = parseInt(rangeMatch[1]);
    const endAge = parseInt(rangeMatch[2]);

    // Categorize based on the range
    if (startAge >= 13 || endAge >= 13) return '13+';
    if (startAge >= 9 || (endAge >= 9 && endAge <= 12)) return '9-12';
    if (startAge >= 6 || (endAge >= 6 && endAge <= 8)) return '6-8';
  }

  // Return original if no pattern matches
  return ageRange;
}

async function normalizeAgeRanges() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Подключение к MongoDB...');
    await client.connect();

    const db = client.db();
    const collection = db.collection('products');

    console.log('📊 Поиск товаров с возрастными диапазонами...');

    // Find all products with ageRange field
    const products = await collection
      .find({
        ageRange: { $exists: true, $ne: null, $ne: '' },
      })
      .toArray();

    console.log(
      `📦 Найдено ${products.length} товаров с возрастными диапазонами`
    );

    const updates = [];
    const stats = {
      total: products.length,
      normalized: 0,
      unchanged: 0,
      errors: 0,
    };

    for (const product of products) {
      try {
        const originalAge = product.ageRange;
        const normalizedAge = normalizeAgeRange(originalAge);

        if (originalAge !== normalizedAge) {
          updates.push({
            updateOne: {
              filter: { _id: product._id },
              update: { $set: { ageRange: normalizedAge } },
            },
          });

          console.log(
            `🔄 ${product.name}: "${originalAge}" → "${normalizedAge}"`
          );
          stats.normalized++;
        } else {
          console.log(`✅ ${product.name}: "${originalAge}" (без изменений)`);
          stats.unchanged++;
        }
      } catch (error) {
        console.error(`❌ Ошибка при обработке товара ${product.name}:`, error);
        stats.errors++;
      }
    }

    // Perform bulk update if there are changes
    if (updates.length > 0) {
      console.log(`\n🚀 Выполнение обновления ${updates.length} товаров...`);
      const result = await collection.bulkWrite(updates);
      console.log(`✅ Обновлено товаров: ${result.modifiedCount}`);
    } else {
      console.log('\n✅ Все возрастные диапазоны уже в правильном формате');
    }

    // Print statistics
    console.log('\n📈 СТАТИСТИКА:');
    console.log(`   Общее количество: ${stats.total}`);
    console.log(`   Нормализовано: ${stats.normalized}`);
    console.log(`   Без изменений: ${stats.unchanged}`);
    console.log(`   Ошибок: ${stats.errors}`);

    // Show current distribution
    console.log('\n📊 РАСПРЕДЕЛЕНИЕ ВОЗРАСТНЫХ ДИАПАЗОНОВ:');
    const distribution = await collection
      .aggregate([
        { $match: { ageRange: { $exists: true, $ne: null, $ne: '' } } },
        { $group: { _id: '$ageRange', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    distribution.forEach(item => {
      console.log(`   ${item._id}: ${item.count} товаров`);
    });
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Соединение с MongoDB закрыто');
  }
}

// Run the script
if (require.main === module) {
  normalizeAgeRanges()
    .then(() => {
      console.log('✅ Скрипт нормализации завершен');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Скрипт завершен с ошибкой:', error);
      process.exit(1);
    });
}

module.exports = { normalizeAgeRanges, normalizeAgeRange };
