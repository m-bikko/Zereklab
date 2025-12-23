'use client';

import { useState, useEffect } from 'react';
import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';
import { type Locale } from '@/lib/i18n';
import { getBlogDesign } from '@/lib/blogDesign';
import MagazineBlogSection from '@/components/blog/MagazineBlogSection';

import Link from 'next/link';
import Image from 'next/image';

import {
  Calendar,
  Clock,
  Eye,
  Heart,
  ArrowRight,
  Tag
} from 'lucide-react';

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
          const fallbackResponse = await fetch('/api/blog?limit=3&sortBy=publishedAt&sortOrder=desc');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setBlogs(fallbackData.blogs || []);
          }
        } else {
          const data = await response.json();
          if (data.length === 0) {
            // Если рекомендуемых нет, получаем последние
            const fallbackResponse = await fetch('/api/blog?limit=3&sortBy=publishedAt&sortOrder=desc');
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
      locale === 'ru' ? 'ru-RU' : 
      locale === 'kk' ? 'kk-KZ' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 aspect-video rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-300 rounded w-20"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ArrowRight className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg mb-4">
          Пока что статей нет
        </p>
        <p className="text-gray-500">
          Следите за обновлениями — скоро здесь появятся интересные материалы!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {blogs.map((blog) => (
        <Link 
          key={blog._id} 
          href={`/${locale}/blog/${blog.slug}`}
          className="group"
        >
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={blog.previewImage}
                alt={getLocalizedText(blog.title, locale)}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Категория или рекомендуемое */}
              <div className="absolute top-4 left-4">
                {blog.isFeatured ? (
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Рекомендуемое
                  </span>
                ) : blog.category && (
                  <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                    {blog.category}
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                {truncateText(getLocalizedText(blog.title, locale), 80)}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {truncateText(getLocalizedText(blog.excerpt, locale), 120)}
              </p>
              
              {/* Теги */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {blog.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {blog.tags.length > 2 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{blog.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-3">
                  {blog.publishedAt && (
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(blog.publishedAt)}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {blog.readingTime || 1} мин
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {blog.views || 0}
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {blog.likes || 0}
                  </span>
                </div>
              </div>
              
              {/* Read more индикатор */}
              <div className="mt-4 flex items-center text-primary-500 text-sm font-medium">
                <span>Читать далее</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}