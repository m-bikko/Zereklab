'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

interface DailyImage {
  id: string;
  name: string;
  data: string;
  uploadDate: string;
}

export default function DailyImageRotation() {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadDailyImage = async () => {
      try {
        // Получаем изображения из localStorage
        const storedImages = localStorage.getItem('zereklab_daily_images');

        if (!storedImages) {
          // Если нет изображений в localStorage, показываем placeholder
          setCurrentImage('/images/placeholder-daily.svg');
          setError(true);
          return;
        }

        const images: DailyImage[] = JSON.parse(storedImages);

        if (images.length === 0) {
          setCurrentImage('/images/placeholder-daily.svg');
          setError(true);
          return;
        }

        // Вычисляем неделю года для ротации
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 1);
        const diff = today.getTime() - start.getTime();
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
        const weekOfYear = Math.floor((dayOfYear - 1) / 7);

        // Выбираем изображение на основе недели года
        const imageIndex = weekOfYear % images.length;
        const selectedImage = images[imageIndex];

        if (selectedImage && selectedImage.data) {
          setCurrentImage(selectedImage.data);
          setError(false);
        } else {
          setCurrentImage('/images/placeholder-daily.svg');
          setError(true);
        }
      } catch (error) {
        console.error('Error loading daily image:', error);
        setCurrentImage('/images/placeholder-daily.svg');
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadDailyImage();
  }, []);

  // Обработка ошибки загрузки изображения
  const handleImageError = () => {
    if (!error) {
      setError(true);
      setCurrentImage('/images/placeholder-daily.svg');
    }
  };

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
          alt="Еженедельное изображение ZerekLab"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 512px"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-sm text-white/90 backdrop-blur-sm">
            {error
              ? 'Добавьте изображения в админке'
              : 'Изображение недели • ZerekLab'}
          </p>
        </div>
      </div>
    </div>
  );
}
