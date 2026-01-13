/**
 * Скрипт миграции: добавление поля status к существующим блогам
 *
 * Проблема: После добавления поля status к модели Blog,
 * старые посты с isPublished=true не отображаются,
 * потому что у них нет поля status='published'.
 *
 * Решение: Установить status='published' для всех постов
 * где isPublished=true и status отсутствует.
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://beimbetm04:qweasdqwe123@zereklab.wqblhwz.mongodb.net/zereklab?retryWrites=true&w=majority&appName=zereklab';

async function migrateBlogStatus() {
  console.log('=== Миграция поля status для блогов ===\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Подключено к MongoDB\n');

    const db = mongoose.connection.db;
    const blogsCollection = db.collection('blogs');

    // Найти все блоги где isPublished=true, но status не равен 'published'
    const blogsToUpdate = await blogsCollection.find({
      isPublished: true,
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: { $ne: 'published' } }
      ]
    }).toArray();

    console.log(`Найдено ${blogsToUpdate.length} блогов для обновления\n`);

    if (blogsToUpdate.length === 0) {
      console.log('Нет блогов для обновления. Миграция не требуется.');
      await mongoose.disconnect();
      return;
    }

    // Показать какие блоги будут обновлены
    console.log('Блоги для обновления:');
    blogsToUpdate.forEach((blog, i) => {
      console.log(`  ${i + 1}. ${blog.slug} (status: ${blog.status || 'undefined'}, isPublished: ${blog.isPublished})`);
    });
    console.log('');

    // Обновить все найденные блоги
    const result = await blogsCollection.updateMany(
      {
        isPublished: true,
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: { $ne: 'published' } }
        ]
      },
      {
        $set: { status: 'published' }
      }
    );

    console.log(`Обновлено ${result.modifiedCount} блогов\n`);

    // Проверить результат
    console.log('=== Проверка результата ===\n');
    const updatedBlogs = await blogsCollection.find({}).toArray();

    updatedBlogs.forEach((blog) => {
      console.log(`${blog.slug}:`);
      console.log(`  status: ${blog.status}`);
      console.log(`  isPublished: ${blog.isPublished}`);
      console.log('');
    });

    console.log('=== Миграция завершена успешно ===');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Ошибка миграции:', err.message);
    process.exit(1);
  }
}

migrateBlogStatus();
