'use client';

import { type Locale, t } from '@/lib/i18n';

import { useCallback, useEffect, useState } from 'react';

import { ChevronDown, Loader2, MessageSquare, Quote, Send } from 'lucide-react';

interface Review {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface ReviewSectionProps {
  locale: Locale;
}

export default function ReviewSection({ locale }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Form state
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchReviews = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(`/api/reviews?page=${pageNum}&limit=3`);
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();

      if (append) {
        setReviews(prev => [...prev, ...data.reviews]);
      } else {
        setReviews(data.reviews);
      }
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке отзыва');
      }

      setSubmitMessage({
        type: 'success',
        text: t('reviews.submit.success', locale),
      });
      setName('');
      setContent('');
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : t('reviews.submit.error', locale),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : locale === 'kk' ? 'kk-KZ' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            {t('reviews.title', locale)}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {t('reviews.subtitle', locale)}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Reviews List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 h-4 w-24 rounded bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-gray-200"></div>
                      <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div
                      key={review._id}
                      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <Quote className="mt-1 h-8 w-8 flex-shrink-0 text-primary-200" />
                        <div>
                          <p className="mb-3 leading-relaxed text-gray-700">
                            {review.content}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium text-gray-700">
                              {review.name}
                            </span>
                            <span>•</span>
                            <span>{formatDate(review.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      {t('reviews.loadMore', locale)}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">{t('reviews.empty', locale)}</p>
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="h-fit lg:sticky lg:top-24">
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                {t('reviews.form.title', locale)}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t('reviews.form.name', locale)}
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('reviews.form.namePlaceholder', locale)}
                    required
                    minLength={2}
                    maxLength={50}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t('reviews.form.content', locale)}
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={t('reviews.form.contentPlaceholder', locale)}
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {content.length}/1000
                  </p>
                </div>

                {submitMessage && (
                  <div
                    className={`rounded-lg p-4 ${
                      submitMessage.type === 'success'
                        ? 'border border-green-200 bg-green-50 text-green-700'
                        : 'border border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {t('reviews.form.submit', locale)}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
