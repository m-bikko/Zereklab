'use client';

import { useState, useEffect } from 'react';
import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';
import { type Locale } from '@/lib/i18n';

import Link from 'next/link';
import Image from 'next/image';

import { ArrowRight, Clock } from 'lucide-react';

interface MagazineBlogSectionProps {
  locale: Locale;
}

export default function MagazineBlogSection({ locale }: MagazineBlogSectionProps) {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/blog/featured?limit=4');

        if (!response.ok) {
          const fallbackResponse = await fetch('/api/blog?limit=4&sortBy=publishedAt&sortOrder=desc');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setBlogs(fallbackData.blogs || []);
          }
        } else {
          const data = await response.json();
          if (data.length === 0) {
            const fallbackResponse = await fetch('/api/blog?limit=4&sortBy=publishedAt&sortOrder=desc');
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
      { day: 'numeric', month: 'short' }
    );
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 mb-4"></div>
            <div className="h-3 bg-gray-200 w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 mb-1"></div>
            <div className="h-4 bg-gray-200 w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  const [mainPost, ...otherPosts] = blogs;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Main Featured Post */}
      {mainPost && (
        <Link href={`/${locale}/blog/${mainPost.slug}`} className="group md:row-span-2">
          <article className="h-full flex flex-col">
            <div className="aspect-[4/3] md:aspect-auto md:flex-1 relative overflow-hidden bg-gray-100">
              <Image
                src={mainPost.previewImage}
                alt={getLocalizedText(mainPost.title, locale)}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {mainPost.category && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-300 mb-2 block">
                    {mainPost.category}
                  </span>
                )}
                <h3 className="text-2xl md:text-3xl font-light leading-tight mb-3 group-hover:text-primary-200 transition-colors">
                  {getLocalizedText(mainPost.title, locale)}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  {mainPost.publishedAt && <span>{formatDate(mainPost.publishedAt)}</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {mainPost.readingTime || 5} min
                  </span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Side Posts */}
      <div className="flex flex-col gap-6">
        {otherPosts.slice(0, 3).map((blog) => (
          <Link key={blog._id} href={`/${locale}/blog/${blog.slug}`} className="group">
            <article className="flex gap-4">
              <div className="w-28 h-28 flex-shrink-0 relative overflow-hidden bg-gray-100">
                <Image
                  src={blog.previewImage}
                  alt={getLocalizedText(blog.title, locale)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                {blog.category && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1">
                    {blog.category}
                  </span>
                )}
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                  {getLocalizedText(blog.title, locale)}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {blog.publishedAt && <span>{formatDate(blog.publishedAt)}</span>}
                  <span>{blog.readingTime || 3} min</span>
                </div>
              </div>
            </article>
          </Link>
        ))}

        {/* View All Link */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors mt-2"
        >
          View all articles
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
