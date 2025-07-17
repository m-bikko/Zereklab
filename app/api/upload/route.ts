import { deleteImage, getPublicIdFromUrl, uploadImage } from '@/lib/cloudinary';

import { NextRequest, NextResponse } from 'next/server';

// Максимальный размер файла (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Поддерживаемые типы файлов
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * POST /api/upload
 * Загружает изображения в Cloudinary
 */
export async function POST(request: NextRequest) {
  // Диагностика переменных окружения
  console.log('Cloudinary config check:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'not set',
    api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'not set',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set',
  });
  try {
    const body = await request.json();
    const { files, folder = 'zereklab' } = body;

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Не предоставлены файлы для загрузки' },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Массив файлов пуст' },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Максимальное количество файлов за раз: 10' },
        { status: 400 }
      );
    }

    const uploadResults = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Валидация файла
        if (!file.data || !file.name || !file.type) {
          errors.push(`Файл ${i + 1}: Неполные данные файла`);
          continue;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push(`Файл ${file.name}: Неподдерживаемый тип файла`);
          continue;
        }

        // Проверка размера файла (приблизительно из base64)
        const base64Size = file.data.length * 0.75; // base64 примерно на 33% больше оригинала
        if (base64Size > MAX_FILE_SIZE) {
          errors.push(`Файл ${file.name}: Размер превышает 10MB`);
          continue;
        }

        // Загрузка в Cloudinary
        console.log(`Начинаем загрузку файла: ${file.name}`);
        const result = await uploadImage(file.data, folder, {
          width: 1200, // Максимальная ширина
          quality: '80', // Качество 80%
          // format убираем, пусть остается оригинальный формат
        });

        console.log(`Файл ${file.name} успешно загружен:`, result.secure_url);
        uploadResults.push({
          originalName: file.name,
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      } catch (uploadError) {
        console.error(`Ошибка загрузки файла ${file.name}:`, uploadError);
        errors.push(`Файл ${file.name}: Ошибка загрузки - ${uploadError}`);
      }
    }

    // Если есть успешные загрузки
    if (uploadResults.length > 0) {
      const response: any = {
        success: true,
        uploaded: uploadResults,
        count: uploadResults.length,
      };

      // Добавляем информацию об ошибках если они есть
      if (errors.length > 0) {
        response.errors = errors;
        response.message = `Загружено ${uploadResults.length} из ${files.length} файлов`;
      } else {
        response.message = `Успешно загружено ${uploadResults.length} файлов`;
      }

      return NextResponse.json(response);
    } else {
      // Если ни один файл не загрузился
      return NextResponse.json(
        {
          success: false,
          error: 'Не удалось загрузить ни одного файла',
          errors,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при загрузке файлов' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Удаляет изображения из Cloudinary
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'Не предоставлены URLs для удаления' },
        { status: 400 }
      );
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: 'Массив URLs пуст' }, { status: 400 });
    }

    const deleteResults = [];
    const errors = [];

    for (const url of urls) {
      try {
        const publicId = getPublicIdFromUrl(url);

        if (!publicId) {
          errors.push(`URL ${url}: Не удалось извлечь public_id`);
          continue;
        }

        await deleteImage(publicId);
        deleteResults.push({ url, publicId, deleted: true });
      } catch (deleteError) {
        console.error(`Error deleting image ${url}:`, deleteError);
        errors.push(`URL ${url}: Ошибка удаления - ${deleteError}`);
      }
    }

    const response: any = {
      success: deleteResults.length > 0,
      deleted: deleteResults,
      count: deleteResults.length,
    };

    if (errors.length > 0) {
      response.errors = errors;
      response.message = `Удалено ${deleteResults.length} из ${urls.length} изображений`;
    } else {
      response.message = `Успешно удалено ${deleteResults.length} изображений`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при удалении файлов' },
      { status: 500 }
    );
  }
}
