'use client';

import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import ClientOnly from './ClientOnly';

interface DailyImage {
  id: string;
  name: string;
  url?: string; // Новый формат с Cloudinary
  data?: string; // Старый формат для обратной совместимости
  uploadDate: string;
}

export default function DailyImageRotation() {
  const locale = useLocale();
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

        if (selectedImage) {
          // Поддерживаем как новый формат (url), так и старый (data)
          const imageUrl = selectedImage.url || selectedImage.data;

          if (imageUrl) {
            setCurrentImage(imageUrl);
            setError(false);
          } else {
            setCurrentImage('/images/placeholder-daily.svg');
            setError(true);
          }
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

  const handleImageError = () => {
    setCurrentImage('/images/placeholder-daily.svg');
    setError(true);
  };

  if (loading) {
    return (
      <ClientOnly>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>
          </div>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="relative mx-auto w-full max-w-lg">
        <div className="animate-pulse-slow absolute -inset-4 rounded-full bg-primary-500/20 blur-xl"></div>
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
          <Image
            src={currentImage}
            alt={t('home.dailyImage.weeklyImage', locale)}
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
                ? t('home.dailyImage.addImages', locale)
                : t('home.dailyImage.weeklyImage', locale)}
            </p>
            {/* Cloudinary badge for cloud-hosted images */}
            {!error && currentImage.includes('cloudinary.com') && (
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                  ☁️ Powered by Cloudinary
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
