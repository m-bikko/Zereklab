'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

export default function DailyImageRotation() {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDailyImage = async () => {
      try {
        // Получаем день года для ротации
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today.getTime() - start.getTime();
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

        // Список возможных изображений
        const maxImages = 10; // Максимальное количество изображений в папке
        const imageIndex = (dayOfYear % maxImages) + 1;

        // Пробуем разные расширения для текущего индекса
        const imageExtensions = ['svg', 'jpg', 'jpeg', 'png', 'webp'];
        let foundImage = '';

        for (const ext of imageExtensions) {
          const imagePath = `/images/daily-rotation/image-${imageIndex}.${ext}`;
          foundImage = imagePath;
          break; // Используем первое найденное изображение
        }

        // Если изображение не найдено, используем запасное
        if (!foundImage) {
          foundImage = '/images/daily-rotation/default.svg';
        }

        setCurrentImage(foundImage);
      } catch (error) {
        console.error('Error loading daily image:', error);
        setCurrentImage('/images/daily-rotation/default.svg');
      } finally {
        setLoading(false);
      }
    };

    loadDailyImage();
  }, []);

  if (loading) {
    return (
      <div className="relative mx-auto w-full max-w-lg">
        <div className="animate-pulse-slow absolute -inset-4 rounded-full bg-primary-500/20 blur-xl"></div>
        <div className="relative aspect-square rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="animate-pulse-slow absolute -inset-4 rounded-full bg-primary-500/20 blur-xl"></div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
        <Image
          src={currentImage}
          alt="Ежедневное изображение ZerekLab"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 512px"
          onError={() => {
            // Fallback если изображение не загрузилось
            setCurrentImage('/images/daily-rotation/default.svg');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-sm text-white/90 backdrop-blur-sm">
            Изображение дня • ZerekLab
          </p>
        </div>
      </div>
    </div>
  );
}
