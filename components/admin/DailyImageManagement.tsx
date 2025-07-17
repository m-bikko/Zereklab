'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

interface DailyImage {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper function to upload images to Cloudinary
const uploadToCloudinary = async (files: File[]): Promise<DailyImage[]> => {
  try {
    // Конвертируем файлы в base64
    const filePromises = files.map(async file => ({
      data: await fileToBase64(file),
      name: file.name,
      type: file.type,
    }));

    const fileData = await Promise.all(filePromises);

    // Отправляем на сервер
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: fileData,
        folder: 'zereklab/daily-images',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка загрузки');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Загрузка не удалась');
    }

    // Конвертируем результат в формат DailyImage
    return result.uploaded.map((item: any) => ({
      id: item.publicId,
      name: item.originalName,
      url: item.url,
      uploadDate: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Helper function to delete images from Cloudinary
const deleteFromCloudinary = async (urls: string[]): Promise<void> => {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Error deleting images:', errorData.error);
      // Не бросаем ошибку, так как удаление изображений не критично
    }
  } catch (error) {
    console.warn('Failed to delete images from Cloudinary:', error);
    // Не бросаем ошибку, так как удаление изображений не критично
  }
};

export default function DailyImageManagement() {
  const [dailyImages, setDailyImages] = useState<DailyImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  // Загрузка существующих изображений при инициализации
  useEffect(() => {
    loadDailyImages();
  }, []);

  const loadDailyImages = () => {
    try {
      // Пытаемся загрузить из localStorage для обратной совместимости
      const storedImages = localStorage.getItem('zereklab_daily_images');
      if (storedImages) {
        const images = JSON.parse(storedImages);
        // Конвертируем старый формат в новый
        const convertedImages = images.map((img: any) => ({
          id: img.id,
          name: img.name,
          url: img.data || img.url, // data для старого формата, url для нового
          uploadDate: img.uploadDate,
        }));
        setDailyImages(convertedImages);
      }
    } catch (error) {
      console.error('Error loading daily images:', error);
    }
  };

  const saveDailyImages = (images: DailyImage[]) => {
    try {
      // Сохраняем в localStorage для обратной совместимости
      const legacyFormat = images.map(img => ({
        id: img.id,
        name: img.name,
        data: img.url, // используем url как data для совместимости
        uploadDate: img.uploadDate,
      }));
      localStorage.setItem(
        'zereklab_daily_images',
        JSON.stringify(legacyFormat)
      );
      setDailyImages(images);
    } catch (error) {
      console.error('Error saving daily images:', error);
      toast.error('Ошибка при сохранении изображений');
    }
  };

  // Валидация файла
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Поддерживаются только форматы: JPG, JPEG, PNG, WEBP');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Размер файла не должен превышать 10MB');
      return false;
    }

    return true;
  };

  // Обработка загрузки файлов
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading(
      `Загрузка ${files.length} изображений в Cloudinary...`
    );

    try {
      // Валидация файлов
      const validFiles: File[] = [];
      let rejectedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!validateFile(file)) {
          rejectedCount++;
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        toast.error('Нет валидных файлов для загрузки', { id: toastId });
        return;
      }

      // Загрузка в Cloudinary
      const uploadedImages = await uploadToCloudinary(validFiles);

      if (uploadedImages.length > 0) {
        const updatedImages = [...dailyImages, ...uploadedImages];
        saveDailyImages(updatedImages);

        const successMessage =
          rejectedCount > 0
            ? `Загружено ${uploadedImages.length} из ${files.length} изображений`
            : `Успешно загружено ${uploadedImages.length} изображений в Cloudinary`;

        toast.success(successMessage, { id: toastId });
      } else {
        toast.error('Не удалось загрузить ни одного изображения', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(`Ошибка при загрузке файлов: ${error}`, { id: toastId });
    } finally {
      setUploading(false);
      // Очищаем input
      event.target.value = '';
    }
  };

  // Удаление изображения
  const handleDeleteImage = async (imageId: string) => {
    const imageToDelete = dailyImages.find(img => img.id === imageId);
    if (!imageToDelete) return;

    const updatedImages = dailyImages.filter(img => img.id !== imageId);
    saveDailyImages(updatedImages);

    // Удаляем из Cloudinary если это Cloudinary URL
    if (imageToDelete.url.includes('cloudinary.com')) {
      await deleteFromCloudinary([imageToDelete.url]);
    }

    toast.success('Изображение удалено');
  };

  // Функции для режима превью
  const openPreview = (index: number) => {
    setCurrentPreviewIndex(index);
    setPreviewMode(true);
  };

  const closePreview = () => {
    setPreviewMode(false);
  };

  const nextPreview = () => {
    setCurrentPreviewIndex(prev =>
      prev === dailyImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevPreview = () => {
    setCurrentPreviewIndex(prev =>
      prev === 0 ? dailyImages.length - 1 : prev - 1
    );
  };

  // Вычисление текущего изображения недели
  const getCurrentWeekImage = (): DailyImage | null => {
    if (dailyImages.length === 0) return null;

    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    const weekOfYear = Math.floor((dayOfYear - 1) / 7);

    const imageIndex = weekOfYear % dailyImages.length;
    return dailyImages[imageIndex];
  };

  const currentWeekImage = getCurrentWeekImage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Управление еженедельными изображениями
        </h2>
        <div className="text-sm text-gray-500">
          Всего изображений: {dailyImages.length}
        </div>
      </div>

      {/* Информация о системе */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 flex items-center text-lg font-semibold text-blue-900">
          <Calendar className="mr-2 h-5 w-5" />
          Как работает система
        </h3>
        <div className="text-sm text-blue-800">
          <ul className="list-disc space-y-1 pl-5">
            <li>Изображения автоматически меняются каждую неделю</li>
            <li>Основаны на номере недели в году</li>
            <li>Все изображения хранятся в Cloudinary</li>
            <li>Поддерживаются форматы: JPG, PNG, WEBP (до 10MB)</li>
            <li>Цикл повторяется: неделя % количество_изображений</li>
          </ul>
        </div>
      </div>

      {/* Текущее изображение недели */}
      {currentWeekImage && (
        <div className="rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <Calendar className="mr-2 h-5 w-5 text-primary-600" />
            Изображение этой недели
          </h3>
          <div className="flex items-center space-x-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg">
              <Image
                src={currentWeekImage.url}
                alt="Изображение недели"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {currentWeekImage.name}
              </p>
              <p className="text-sm text-gray-600">
                Загружено:{' '}
                {new Date(currentWeekImage.uploadDate).toLocaleDateString(
                  'ru-RU'
                )}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  ☁️ Cloudinary
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Загрузка файлов */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="daily-images-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Загрузить новые изображения в Cloudinary
              </span>
              <span className="mt-1 block text-sm text-gray-600">
                Поддерживаются: JPG, PNG, WEBP (до 10MB)
              </span>
            </label>
            <input
              id="daily-images-upload"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
          <div className="mt-6">
            <button
              onClick={() =>
                document.getElementById('daily-images-upload')?.click()
              }
              disabled={uploading}
              className="inline-flex items-center rounded-lg bg-primary-500 px-6 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Загрузка в Cloudinary...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Выбрать файлы
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Список изображений */}
      {dailyImages.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Загруженные изображения
            </h3>
            <button
              onClick={() => openPreview(0)}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Просмотр слайдшоу
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {dailyImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20">
                    <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button
                        onClick={() => openPreview(index)}
                        className="rounded-full bg-blue-500 p-2 text-white shadow-lg transition-colors hover:bg-blue-600"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Неделя {(index % dailyImages.length) + 1} в цикле
                  </p>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      ☁️ Cloudinary
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-4 text-lg font-semibold text-yellow-800">
            Нет загруженных изображений
          </h3>
          <p className="mt-2 text-yellow-700">
            Загрузите изображения для еженедельной ротации на главной странице
          </p>
        </div>
      )}

      {/* Режим превью */}
      {previewMode && dailyImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative max-h-screen max-w-screen-lg p-4">
            <button
              onClick={closePreview}
              className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-2 text-gray-900 shadow-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative">
              <Image
                src={dailyImages[currentPreviewIndex].url}
                alt={dailyImages[currentPreviewIndex].name}
                width={800}
                height={600}
                className="max-h-[80vh] w-auto rounded-lg object-contain"
              />

              {dailyImages.length > 1 && (
                <>
                  <button
                    onClick={prevPreview}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white bg-opacity-80 p-3 text-gray-900 shadow-lg hover:bg-opacity-100"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextPreview}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white bg-opacity-80 p-3 text-gray-900 shadow-lg hover:bg-opacity-100"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 text-center">
              <h4 className="text-lg font-semibold text-white">
                {dailyImages[currentPreviewIndex].name}
              </h4>
              <p className="text-sm text-gray-300">
                {currentPreviewIndex + 1} из {dailyImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
