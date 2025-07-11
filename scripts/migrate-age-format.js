const { MongoClient } = require('mongodb');

// Database connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/zereklab';

// Convert old age range format to new minimum age format
function convertToMinimumAge(ageRange) {
  if (!ageRange) return '';

  // Remove "лет" and extra whitespace
  const cleaned = ageRange.replace(/лет/gi, '').trim();

  // If already in correct format (number+), return as is
  const plusMatch = cleaned.match(/^(\d+)\+$/);
  if (plusMatch) {
    return cleaned;
  }

  // Convert range format "6-8" to minimum age "6+"
  const rangeMatch = cleaned.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return `${rangeMatch[1]}+`;
  }

  // Convert single number to minimum age format
  const numberMatch = cleaned.match(/^(\d+)$/);
  if (numberMatch) {
    return `${numberMatch[1]}+`;
  }

  // Return original if no pattern matches
  return ageRange;
}

async function migrateAgeFormat() {
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
      converted: 0,
      unchanged: 0,
      errors: 0,
    };

    for (const product of products) {
      try {
        const originalAge = product.ageRange;
        const convertedAge = convertToMinimumAge(originalAge);

        if (originalAge !== convertedAge) {
          updates.push({
            updateOne: {
              filter: { _id: product._id },
              update: { $set: { ageRange: convertedAge } },
            },
          });

          console.log(
            `🔄 ${product.name}: "${originalAge}" → "${convertedAge}"`
          );
          stats.converted++;
        } else {
          console.log(`✅ ${product.name}: "${originalAge}" (без изменений)`);
          stats.unchanged++;
        }
      } catch (error) {
        console.error(`❌ Ошибка обработки товара ${product.name}:`, error);
        stats.errors++;
      }
    }

    // Execute bulk update if there are changes
    if (updates.length > 0) {
      console.log(`\n📝 Применение ${updates.length} обновлений...`);
      const result = await collection.bulkWrite(updates);
      console.log(`✅ Обновлено товаров: ${result.modifiedCount}`);
    } else {
      console.log('\n✅ Нет товаров для обновления');
    }

    // Display final statistics
    console.log('\n📊 СТАТИСТИКА МИГРАЦИИ:');
    console.log(`📦 Всего товаров: ${stats.total}`);
    console.log(`🔄 Конвертировано: ${stats.converted}`);
    console.log(`✅ Без изменений: ${stats.unchanged}`);
    console.log(`❌ Ошибок: ${stats.errors}`);

    if (stats.converted > 0) {
      console.log('\n🎉 Миграция возрастных форматов завершена успешно!');
      console.log(
        'Теперь товары используют минимальный возраст (например: 3+, 6+)'
      );
    }
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Соединение с MongoDB закрыто');
  }
}

// Run the migration
if (require.main === module) {
  migrateAgeFormat();
}

module.exports = { migrateAgeFormat, convertToMinimumAge };
