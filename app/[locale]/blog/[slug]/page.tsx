'use client';

import { useState, useEffect, useCallback } from 'react';
import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';
import { type Locale, t } from '@/lib/i18n';
import { getBlogDesign } from '@/lib/blogDesign';
import MagazineBlogPost from '@/components/blog/MagazineBlogPost';

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Tag,
  User,
  ChevronLeft,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface BlogPostPageProps {
  params: { locale: string; slug: string };
}

interface BlogWithRelated extends Omit<IBlog, 'relatedPosts'> {
  relatedPosts?: IBlog[];
}

const blogDesign = getBlogDesign();

export default function BlogPostPage({ params: { locale, slug } }: BlogPostPageProps) {
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
      const response = await fetch('/api/blog?limit=4&sortBy=publishedAt&sortOrder=desc');
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
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlog(prev => prev ? { ...prev, likes: data.likes } : null);
        setHasLiked(true);
        
        // Сохраняем в localStorage
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
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
      currentLocale === 'ru' ? 'ru-RU' : 
      currentLocale === 'kk' ? 'kk-KZ' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Скелетон для загрузки */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href={`/${currentLocale}/blog`}
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('blog.back', currentLocale)} 
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Заголовок и мета-информация */}
        <header className="mb-8">
          <div className="mb-4">
            {blog.category && (
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full mb-4">
                {blog.category}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-fredoka leading-tight">
            {getLocalizedText(blog.title, currentLocale)}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            {blog.author && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>{blog.author.name}</span>
              </div>
            )}
            
            {blog.publishedAt && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{blog.readingTime || 1} {t('blog.reading.time', currentLocale)}</span>
            </div>
            
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              <span>{blog.views || 0}</span>
            </div>
            
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              <span>{blog.likes || 0}</span>
            </div>
          </div>
          
          {/* Теги */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Превью изображение */}
        <div className="mb-8">
          <div className="aspect-video relative overflow-hidden rounded-xl shadow-lg">
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
        <div className="bg-blue-50 border-l-4 border-primary-500 p-6 mb-8 rounded-r-lg">
          <p className="text-lg text-gray-700 leading-relaxed">
            {getLocalizedText(blog.excerpt, currentLocale)}
          </p>
        </div>

        {/* Основное содержание */}
        <div
          className="prose prose-lg max-w-none mb-8 prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:marker:text-primary-500 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-primary-500 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4"
          dangerouslySetInnerHTML={{
            __html: getLocalizedText(blog.content, currentLocale)
          }}
        />

        {/* Медиа контент */}
        {blog.media && blog.media.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t('blog.media', currentLocale)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blog.media.map((media, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {media.type === 'image' ? (
                    <div className="aspect-video relative">
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
                        className="w-full h-full"
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                Источники информации
              </h3>
              <div className="space-y-3">
                {blog.sources.map((source, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group"
                      >
                        <span className="mr-1">{source.title}</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                      <p className="text-xs text-gray-500 mt-1 break-all">{source.url}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Действия: лайк и поделиться */}
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking || hasLiked}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                hasLiked
                  ? 'bg-red-100 text-red-700 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
              }`}
            >
              <Heart 
                className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-current' : ''}`} 
              />
              {isLiking ? 'Добавляется...' : hasLiked ? 'Понравилось' : t('blog.like', currentLocale)}
              <span className="ml-2 text-sm">({blog.likes || 0})</span>
            </button>
          </div>
          
          <button
            onClick={handleShare}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t('blog.share', currentLocale)}
          </button>
        </div>
      </article>

      {/* Связанные статьи */}
      {blog.relatedPosts && blog.relatedPosts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {t('blog.related', currentLocale)}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blog.relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost._id}
                  href={`/${currentLocale}/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={relatedPost.previewImage}
                        alt={getLocalizedText(relatedPost.title, currentLocale)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {getLocalizedText(relatedPost.title, currentLocale)}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {getLocalizedText(relatedPost.excerpt, currentLocale)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
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
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {t('blog.latest', currentLocale)}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentBlogs.slice(0, 4).map((recentPost) => (
                <Link 
                  key={recentPost._id}
                  href={`/${currentLocale}/blog/${recentPost.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                    <div className="flex">
                      <div className="w-24 h-24 relative flex-shrink-0">
                        <Image
                          src={recentPost.previewImage}
                          alt={getLocalizedText(recentPost.title, currentLocale)}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 p-4">
                        <h3 className="font-medium text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {getLocalizedText(recentPost.title, currentLocale)}
                        </h3>
                        <p className="text-gray-600 text-xs mb-2 line-clamp-1">
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