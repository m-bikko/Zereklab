'use client';

import MagazineBlogPost from '@/components/blog/MagazineBlogPost';
import { getBlogDesign } from '@/lib/blogDesign';
import { type Locale, t } from '@/lib/i18n';
import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';

import { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  Share2,
  Tag,
  User,
} from 'lucide-react';

interface BlogPostPageProps {
  params: { locale: string; slug: string };
}

interface BlogWithRelated extends Omit<IBlog, 'relatedPosts'> {
  relatedPosts?: IBlog[];
}

const blogDesign = getBlogDesign();

export default function BlogPostPage({
  params: { locale, slug },
}: BlogPostPageProps) {
  const currentLocale = locale as Locale;
  const [blog, setBlog] = useState<BlogWithRelated | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [recentBlogs, setRecentBlogs] = useState<IBlog[]>([]);

  // Загрузка статьи
  const fetchBlog = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/blog/${slug}`);

      if (response.status === 404) {
        notFound();
      }

      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }

      const data = await response.json();
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      notFound();
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // Загрузка последних статей
  const fetchRecentBlogs = useCallback(async () => {
    try {
      const response = await fetch(
        '/api/blog?limit=4&sortBy=publishedAt&sortOrder=desc'
      );
      if (response.ok) {
        const data = await response.json();
        setRecentBlogs(data.blogs?.filter((b: IBlog) => b.slug !== slug) || []);
      }
    } catch (error) {
      console.error('Error fetching recent blogs:', error);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlog();
    fetchRecentBlogs();
  }, [fetchBlog, fetchRecentBlogs]);

  useEffect(() => {
    // Проверяем, лайкал ли пользователь уже эту статью
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    setHasLiked(likedPosts.includes(slug));
  }, [slug]);

  // Лайк статьи
  const handleLike = async () => {
    if (isLiking || hasLiked) return;

    try {
      setIsLiking(true);
      const response = await fetch(`/api/blog/${slug}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setBlog(prev => (prev ? { ...prev, likes: data.likes } : null));
        setHasLiked(true);

        // Сохраняем в localStorage
        const likedPosts = JSON.parse(
          localStorage.getItem('likedPosts') || '[]'
        );
        likedPosts.push(slug);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Поделиться
  const handleShare = () => {
    const url = window.location.href;
    const title = blog ? getLocalizedText(blog.title, currentLocale) : '';

    if (navigator.share) {
      navigator.share({
        title: title,
        url: url,
      });
    } else {
      // Fallback: копируем URL в буфер обмена
      navigator.clipboard.writeText(url).then(() => {
        // Можно показать уведомление
        alert('Ссылка скопирована в буфер обмена!');
      });
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(
      currentLocale === 'ru'
        ? 'ru-RU'
        : currentLocale === 'kk'
          ? 'kk-KZ'
          : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Скелетон для загрузки */}
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-3/4 rounded bg-gray-300"></div>
            <div className="mb-6 h-64 rounded bg-gray-300"></div>
            <div className="space-y-3">
              <div className="h-4 rounded bg-gray-300"></div>
              <div className="h-4 w-5/6 rounded bg-gray-300"></div>
              <div className="h-4 w-4/6 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    notFound();
  }

  // Magazine Design
  if (blogDesign === 'magazine') {
    return (
      <MagazineBlogPost
        locale={currentLocale}
        blog={blog}
        recentBlogs={recentBlogs}
        hasLiked={hasLiked}
        isLiking={isLiking}
        onLike={handleLike}
      />
    );
  }

  // Default Design
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация назад */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link
            href={`/${currentLocale}/blog`}
            className="inline-flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('blog.back', currentLocale)}
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-8">
        {/* Заголовок и мета-информация */}
        <header className="mb-8">
          <div className="mb-4">
            {blog.category && (
              <span className="mb-4 inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
                {blog.category}
              </span>
            )}
          </div>

          <h1 className="mb-6 font-fredoka text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {getLocalizedText(blog.title, currentLocale)}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
            {blog.author && (
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{blog.author.name}</span>
              </div>
            )}

            {blog.publishedAt && (
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
            )}

            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>
                {blog.readingTime || 1} {t('blog.reading.time', currentLocale)}
              </span>
            </div>

            <div className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              <span>{blog.views || 0}</span>
            </div>

            <div className="flex items-center">
              <Heart className="mr-2 h-4 w-4" />
              <span>{blog.likes || 0}</span>
            </div>
          </div>

          {/* Теги */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Превью изображение */}
        <div className="mb-8">
          <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg">
            <Image
              src={blog.previewImage}
              alt={getLocalizedText(blog.title, currentLocale)}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Краткое описание */}
        <div className="mb-8 rounded-r-lg border-l-4 border-primary-500 bg-blue-50 p-6">
          <p className="text-lg leading-relaxed text-gray-700">
            {getLocalizedText(blog.excerpt, currentLocale)}
          </p>
        </div>

        {/* Основное содержание */}
        <div
          className="prose prose-lg mb-8 max-w-none prose-headings:text-gray-900 prose-p:leading-relaxed prose-p:text-gray-700 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary-500 prose-blockquote:bg-gray-50 prose-blockquote:px-4 prose-blockquote:py-1 prose-strong:text-gray-900 prose-ol:text-gray-700 prose-ul:text-gray-700 prose-li:marker:text-primary-500"
          dangerouslySetInnerHTML={{
            __html: getLocalizedText(blog.content, currentLocale),
          }}
        />

        {/* Медиа контент */}
        {blog.media && blog.media.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              {t('blog.media', currentLocale)}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {blog.media.map((media, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg bg-white shadow-md"
                >
                  {media.type === 'image' ? (
                    <div className="relative aspect-video">
                      <Image
                        src={media.url}
                        alt={media.alt || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : media.type === 'video' ? (
                    <div className="aspect-video">
                      <iframe
                        src={media.url}
                        title={media.alt || 'Video'}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    </div>
                  ) : null}

                  {media.caption && (
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        {getLocalizedText(media.caption, currentLocale)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Источники информации */}
        {blog.sources && blog.sources.length > 0 && (
          <div className="mb-8">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
                Источники информации
              </h3>
              <div className="space-y-3">
                {blog.sources.map((source, index) => (
                  <div key={index} className="flex items-start">
                    <span className="mr-3 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center font-medium text-blue-600 transition-colors hover:text-blue-800"
                      >
                        <span className="mr-1">{source.title}</span>
                        <ExternalLink className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                      <p className="mt-1 break-all text-xs text-gray-500">
                        {source.url}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Действия: лайк и поделиться */}
        <div className="mb-8 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking || hasLiked}
              className={`flex items-center rounded-lg px-4 py-2 transition-colors ${
                hasLiked
                  ? 'cursor-not-allowed bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
              }`}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${hasLiked ? 'fill-current' : ''}`}
              />
              {isLiking
                ? 'Добавляется...'
                : hasLiked
                  ? 'Понравилось'
                  : t('blog.like', currentLocale)}
              <span className="ml-2 text-sm">({blog.likes || 0})</span>
            </button>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-blue-100 hover:text-blue-700"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t('blog.share', currentLocale)}
          </button>
        </div>
      </article>

      {/* Связанные статьи */}
      {blog.relatedPosts && blog.relatedPosts.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              {t('blog.related', currentLocale)}
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blog.relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost._id}
                  href={`/${currentLocale}/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <article className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg group-hover:-translate-y-1">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={relatedPost.previewImage}
                        alt={getLocalizedText(relatedPost.title, currentLocale)}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
                        {getLocalizedText(relatedPost.title, currentLocale)}
                      </h3>
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {getLocalizedText(relatedPost.excerpt, currentLocale)}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        {relatedPost.publishedAt && (
                          <span>{formatDate(relatedPost.publishedAt)}</span>
                        )}
                        <span>{relatedPost.readingTime || 1} мин</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Последние статьи */}
      {recentBlogs.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              {t('blog.latest', currentLocale)}
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {recentBlogs.slice(0, 4).map(recentPost => (
                <Link
                  key={recentPost._id}
                  href={`/${currentLocale}/blog/${recentPost.slug}`}
                  className="group"
                >
                  <article className="overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex">
                      <div className="relative h-24 w-24 flex-shrink-0">
                        <Image
                          src={recentPost.previewImage}
                          alt={getLocalizedText(
                            recentPost.title,
                            currentLocale
                          )}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 p-4">
                        <h3 className="mb-1 line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-primary-600">
                          {getLocalizedText(recentPost.title, currentLocale)}
                        </h3>
                        <p className="mb-2 line-clamp-1 text-xs text-gray-600">
                          {getLocalizedText(recentPost.excerpt, currentLocale)}
                        </p>

                        <div className="flex items-center text-xs text-gray-500">
                          {recentPost.publishedAt && (
                            <span>{formatDate(recentPost.publishedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
