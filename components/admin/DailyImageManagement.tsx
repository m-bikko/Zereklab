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
  Upload,
  X,
} from 'lucide-react';

interface DailyImage {
  id: string;
  name: string;
  data: string;
  uploadDate: string;
}

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
      const storedImages = localStorage.getItem('zereklab_daily_images');
      if (storedImages) {
        const images = JSON.parse(storedImages);
        setDailyImages(images);
      }
    } catch (error) {
      console.error('Error loading daily images:', error);
    }
  };

  const saveDailyImages = (images: DailyImage[]) => {
    try {
      localStorage.setItem('zereklab_daily_images', JSON.stringify(images));
      setDailyImages(images);
    } catch (error) {
      console.error('Error saving daily images:', error);
      toast.error('Ошибка при сохранении изображений');
    }
  };

  // Конвертация файла в base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Валидация файла
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Поддерживаются только форматы: JPG, JPEG, PNG');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Размер файла не должен превышать 5MB');
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

    try {
      const newImages: DailyImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!validateFile(file)) {
          continue;
        }

        const base64Data = await fileToBase64(file);
        const imageId = `daily_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        newImages.push({
          id: imageId,
          name: file.name,
          data: base64Data,
          uploadDate: new Date().toISOString(),
        });
      }

      if (newImages.length > 0) {
        const updatedImages = [...dailyImages, ...newImages];
        saveDailyImages(updatedImages);
        toast.success(`Загружено ${newImages.length} изображений`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Ошибка при загрузке файлов');
    } finally {
      setUploading(false);
      // Очищаем input
      event.target.value = '';
    }
  };

  // Удаление изображения
  const handleDeleteImage = (imageId: string) => {
    const updatedImages = dailyImages.filter(img => img.id !== imageId);
    saveDailyImages(updatedImages);
    toast.success('Изображение удалено');
  };

  // Получение текущего изображения дня
  const getCurrentDayImage = (): DailyImage | null => {
    if (dailyImages.length === 0) return null;

    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const imageIndex = dayOfYear % dailyImages.length;
    return dailyImages[imageIndex] || null;
  };

  const currentDayImage = getCurrentDayImage();

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление Изображениями Дня
          </h2>
          <p className="text-gray-600">
            Загружайте изображения, которые будут показываться на главной
            странице
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
            Всего: {dailyImages.length}
          </div>
          {previewMode && (
            <button
              onClick={() => setPreviewMode(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Закрыть превью
            </button>
          )}
        </div>
      </div>

      {/* Текущее изображение дня */}
      {currentDayImage && (
        <div className="rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <Calendar className="mr-2 h-5 w-5 text-primary-600" />
            Изображение сегодня
          </h3>
          <div className="flex items-center space-x-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg">
              <Image
                src={currentDayImage.data}
                alt="Изображение дня"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {currentDayImage.name}
              </p>
              <p className="text-sm text-gray-600">
                Загружено:{' '}
                {new Date(currentDayImage.uploadDate).toLocaleDateString(
                  'ru-RU'
                )}
              </p>
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
                Загрузить новые изображения
              </span>
              <span className="mt-1 block text-sm text-gray-600">
                Поддерживаются: JPG, PNG, JPEG (до 5MB)
              </span>
            </label>
            <input
              id="daily-images-upload"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png"
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
                  Загрузка...
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
              Загруженные изображения ({dailyImages.length})
            </h3>
            <button
              onClick={() => setPreviewMode(true)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Режим превью
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dailyImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.data}
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
                  </div>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    День {(index % dailyImages.length) + 1} в цикле
                  </p>
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
            Загрузите изображения для ежедневной ротации на главной странице
          </p>
        </div>
      )}

      {/* Режим превью */}
      {previewMode && dailyImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setPreviewMode(false)}
              className="absolute -right-4 -top-4 z-10 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative aspect-square max-h-[80vh] overflow-hidden rounded-lg">
              <Image
                src={dailyImages[currentPreviewIndex].data}
                alt={dailyImages[currentPreviewIndex].name}
                fill
                className="object-cover"
              />
            </div>

            {dailyImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentPreviewIndex(prev =>
                      prev === 0 ? dailyImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-sm hover:bg-white"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPreviewIndex(prev =>
                      prev === dailyImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-sm hover:bg-white"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="mt-4 text-center">
              <p className="text-white">
                {currentPreviewIndex + 1} из {dailyImages.length} •{' '}
                {dailyImages[currentPreviewIndex].name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
