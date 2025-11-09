import { UploadApiOptions, v2 as cloudinary } from 'cloudinary';

// Интерфейс для параметров трансформации Cloudinary
interface CloudinaryTransforms {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
  [key: string]: string | number | undefined;
}

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Всегда использовать HTTPS
});

/**
 * Загружает изображение в Cloudinary
 * @param file - File объект или base64 строка
 * @param folder - папка в Cloudinary (по умолчанию 'zereklab')
 * @param transformation - параметры трансформации изображения
 * @returns Promise с результатом загрузки
 */
export const uploadImage = async (
  file: string, // base64 или URL файла
  folder = 'zereklab',
  transformation?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }
): Promise<{
  url: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}> => {
  try {
    const uploadOptions: UploadApiOptions = {
      folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'image',
    };

    // Упрощенные трансформации - применяем их только при необходимости
    if (transformation) {
      const transforms: CloudinaryTransforms = {};

      if (transformation.width) transforms.width = transformation.width;
      if (transformation.height) transforms.height = transformation.height;
      if (transformation.width || transformation.height) {
        transforms.crop = 'limit'; // Ограничить размер, сохраняя пропорции
      }

      if (transformation.quality && transformation.quality !== 'auto') {
        transforms.quality = transformation.quality;
      }

      if (transformation.format && transformation.format !== 'auto') {
        uploadOptions.format = transformation.format;
      }

      if (Object.keys(transforms).length > 0) {
        uploadOptions.transformation = [transforms];
      }
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error}`);
  }
};

/**
 * Удаляет изображение из Cloudinary
 * @param publicId - идентификатор изображения в Cloudinary
 * @returns Promise с результатом удаления
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image from Cloudinary: ${error}`);
  }
};

/**
 * Получает оптимизированный URL изображения с трансформациями
 * @param publicId - идентификатор изображения в Cloudinary
 * @param transformation - параметры трансформации
 * @returns оптимизированный URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  transformation?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  }
): string => {
  if (!publicId) return '';

  const transforms: Record<string, string | number | boolean> = {
    f_auto: true, // Автоматический выбор формата
    q_auto: true, // Автоматическое качество
  };

  if (transformation) {
    if (transformation.width) transforms.w = transformation.width;
    if (transformation.height) transforms.h = transformation.height;
    if (transformation.quality) transforms.q = transformation.quality;
    if (transformation.format) transforms.f = transformation.format;
    if (transformation.crop) transforms.c = transformation.crop;
  }

  return cloudinary.url(publicId, transforms);
};

/**
 * Проверяет, является ли URL изображением из Cloudinary
 * @param url - URL для проверки
 * @returns true если это Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

/**
 * Извлекает public_id из Cloudinary URL
 * @param url - Cloudinary URL
 * @returns public_id или null
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) return null;

  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud-name/image/upload/v123456/folder/filename.ext
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');

    if (uploadIndex === -1) return null;

    // Skip version if present (starts with 'v' followed by numbers)
    let startIndex = uploadIndex + 1;
    if (urlParts[startIndex] && urlParts[startIndex].match(/^v\d+$/)) {
      startIndex++;
    }

    // Join the remaining parts and remove file extension
    const publicIdParts = urlParts.slice(startIndex);
    const publicIdWithExt = publicIdParts.join('/');

    // Remove file extension
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};

export default cloudinary;
