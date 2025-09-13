'use client';

import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';

import { useEffect, useState } from 'react';

import { Quote } from 'lucide-react';

import ClientOnly from './ClientOnly';

interface DailyQuote {
  id: string;
  text: string;
  author: string;
  dateAdded: string;
}

export default function DailyImageRotation() {
  const locale = useLocale();
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDailyQuote = () => {
      try {
        // Загружаем цитаты из localStorage
        const storedQuotes = localStorage.getItem('zereklab_daily_quotes');
        if (!storedQuotes) {
          setCurrentQuote(null);
          setLoading(false);
          return;
        }

        const quotes: DailyQuote[] = JSON.parse(storedQuotes);
        if (quotes.length === 0) {
          setCurrentQuote(null);
          setLoading(false);
          return;
        }

        // Вычисляем день года для ежедневной ротации
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

        // Выбираем цитату на основе дня года
        const quoteIndex = dayOfYear % quotes.length;
        const selectedQuote = quotes[quoteIndex];

        setCurrentQuote(selectedQuote);
      } catch (error) {
        console.error('Error loading daily quote:', error);
        setCurrentQuote(null);
      } finally {
        setLoading(false);
      }
    };

    loadDailyQuote();
  }, []);

  if (loading || !currentQuote) {
    return (
      <ClientOnly>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-yellow-600/50 shadow-2xl transform rotate-2" style={{ backgroundColor: '#f6e22a' }}>
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
            </div>
          </div>
        </div>
      </ClientOnly>
    );
  }

  const quoteText = currentQuote.text;
  const authorName = currentQuote.author;

  return (
    <ClientOnly>
      <div className="relative mx-auto w-full max-w-lg">
        <div className="animate-pulse-slow absolute -inset-4 rounded-full bg-yellow-300/30 blur-xl"></div>
        <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-yellow-600/50 shadow-2xl transform rotate-2 hover:rotate-1 transition-transform duration-300" style={{ backgroundColor: '#f6e22a', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
          {/* Quote Icon */}
          <div className="absolute left-6 top-6">
            <Quote className="h-8 w-8 text-black/70" />
          </div>
          
          {/* Main Quote Content */}
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <blockquote className="mb-4 text-lg font-bold leading-relaxed text-black sm:text-xl lg:text-2xl">
              &ldquo;{quoteText}&rdquo;
            </blockquote>
            
            <div className="mt-2">
              <div className="h-px w-16 bg-black/30 mx-auto mb-3"></div>
              <cite className="text-sm font-semibold text-black/80 sm:text-base">
                - {authorName}
              </cite>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-6 right-6">
            <Quote className="h-6 w-6 text-black/40 rotate-180" />
          </div>
          
          {/* Daily indicator */}
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-black/80">
              📅 {t('home.dailyQuote.dailyQuote', locale)}
            </span>
          </div>
        </div>
      </div>
    </ClientOnly>
  );

  // Fallback when no quotes available
  return (
    <ClientOnly>
      <div className="relative mx-auto w-full max-w-lg">
        <div className="animate-pulse-slow absolute -inset-4 rounded-full bg-yellow-300/30 blur-xl"></div>
        <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-yellow-600/50 shadow-2xl transform rotate-2" style={{ backgroundColor: '#f6e22a' }}>
          {/* Quote Icon */}
          <div className="absolute left-6 top-6">
            <Quote className="h-8 w-8 text-black/70" />
          </div>
          
          {/* No quotes message */}
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <blockquote className="mb-4 text-lg font-bold leading-relaxed text-black sm:text-xl lg:text-2xl">
              {t('home.dailyQuote.noQuotes', locale)}
            </blockquote>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-6 right-6">
            <Quote className="h-6 w-6 text-black/40 rotate-180" />
          </div>
          
          {/* Daily indicator */}
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-black/80">
              📅 {t('home.dailyQuote.dailyQuote', locale)}
            </span>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
