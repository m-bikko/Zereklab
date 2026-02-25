'use client';

import MagazineBlogSection from '@/components/blog/MagazineBlogSection';
import { getBlogDesign } from '@/lib/blogDesign';
import { type Locale } from '@/lib/i18n';
import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight, Calendar, Clock, Eye, Heart, Tag } from 'lucide-react';

interface BlogSectionProps {
  locale: Locale;
}

const blogDesign = getBlogDesign();

export default function BlogSection({ locale }: BlogSectionProps) {
  // Magazine Design
  if (blogDesign === 'magazine') {
    return <MagazineBlogSection locale={locale} />;
  }

  return <DefaultBlogSection locale={locale} />;
}

function DefaultBlogSection({ locale }: BlogSectionProps) {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/blog/featured?limit=3');

        if (!response.ok) {
          // Если нет рекомендуемых, получаем последние
          const fallbackResponse = await fetch(
            '/api/blog?limit=3&sortBy=publishedAt&sortOrder=desc'
          );
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setBlogs(fallbackData.blogs || []);
          }
        } else {
          const data = await response.json();
          if (data.length === 0) {
            // Если рекомендуемых нет, получаем последние
            const fallbackResponse = await fetch(
              '/api/blog?limit=3&sortBy=publishedAt&sortOrder=desc'
            );
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setBlogs(fallbackData.blogs || []);
            }
          } else {
            setBlogs(data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestBlogs();
  }, []);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : locale === 'kk' ? 'kk-KZ' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-4 aspect-video rounded-lg bg-gray-300"></div>
            <div className="mb-2 h-4 rounded bg-gray-300"></div>
            <div className="mb-4 h-4 w-3/4 rounded bg-gray-300"></div>
            <div className="flex justify-between">
              <div className="h-3 w-20 rounded bg-gray-300"></div>
              <div className="h-3 w-16 rounded bg-gray-300"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <ArrowRight className="h-8 w-8 text-gray-400" />
        </div>
        <p className="mb-4 text-lg text-gray-600">Пока что статей нет</p>
        <p className="text-gray-500">
          Следите за обновлениями — скоро здесь появятся интересные материалы!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {blogs.map(blog => (
        <Link
          key={blog._id}
          href={`/${locale}/blog/${blog.slug}`}
          className="group"
        >
          <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg group-hover:-translate-y-1">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={blog.previewImage}
                alt={getLocalizedText(blog.title, locale)}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Категория или рекомендуемое */}
              <div className="absolute left-4 top-4">
                {blog.isFeatured ? (
                  <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white">
                    Рекомендуемое
                  </span>
                ) : (
                  blog.category && (
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm">
                      {blog.category}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="p-6">
              <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
                {truncateText(getLocalizedText(blog.title, locale), 80)}
              </h3>

              <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                {truncateText(getLocalizedText(blog.excerpt, locale), 120)}
              </p>

              {/* Теги */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {blog.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                  {blog.tags.length > 2 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{blog.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-3">
                  {blog.publishedAt && (
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(blog.publishedAt)}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {blog.readingTime || 1} мин
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Eye className="mr-1 h-4 w-4" />
                    {blog.views || 0}
                  </span>
                  <span className="flex items-center">
                    <Heart className="mr-1 h-4 w-4" />
                    {blog.likes || 0}
                  </span>
                </div>
              </div>

              {/* Read more индикатор */}
              <div className="mt-4 flex items-center text-sm font-medium text-primary-500">
                <span>Читать далее</span>
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
