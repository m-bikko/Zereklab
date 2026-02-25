'use client';

// import { useLocale } from '@/hooks/useLocale';
// import { t } from '@/lib/i18n';
import { useEffect, useState } from 'react';

import { Quote } from 'lucide-react';

import ClientOnly from './ClientOnly';

interface RandomQuote {
  _id?: string;
  text: string;
  author: string;
  isActive?: boolean;
}

export default function DailyImageRotation() {
  // const locale = useLocale();
  const [currentQuote, setCurrentQuote] = useState<RandomQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRandomQuote = async () => {
      try {
        const response = await fetch('/api/quotes');
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setCurrentQuote(result.data);
        } else {
          setCurrentQuote(null);
        }
      } catch (error) {
        console.error('Error loading random quote:', error);
        // Fallback quote if API fails
        setCurrentQuote({
          text: 'Образование — это самое мощное оружие, которое вы можете использовать, чтобы изменить мир.',
          author: 'Нельсон Мандела',
        });
      } finally {
        setLoading(false);
      }
    };

    loadRandomQuote();
  }, []);

  if (loading || !currentQuote) {
    return (
      <ClientOnly>
        <div className="relative mx-auto w-full max-w-lg">
          <div
            className="relative aspect-square rotate-2 transform overflow-hidden rounded-2xl border-2 border-yellow-600/50 shadow-2xl"
            style={{ backgroundColor: '#f6e22a' }}
          >
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
        <div
          className="relative aspect-square rotate-2 transform overflow-hidden rounded-2xl border-2 border-yellow-600/50 shadow-2xl transition-transform duration-300 hover:rotate-1"
          style={{
            backgroundColor: '#f6e22a',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
          }}
        >
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
              <div className="mx-auto mb-3 h-px w-16 bg-black/30"></div>
              <cite className="text-sm font-semibold text-black/80 sm:text-base">
                - {authorName}
              </cite>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-6 right-6">
            <Quote className="h-6 w-6 rotate-180 text-black/40" />
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
