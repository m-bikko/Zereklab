'use client';

import MagazineBlogList from '@/components/blog/MagazineBlogList';
import { getBlogDesign } from '@/lib/blogDesign';
import { type Locale, t } from '@/lib/i18n';
import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';

import { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Heart,
  Search,
  Tag,
  TrendingUp,
} from 'lucide-react';

interface BlogPageProps {
  params: { locale: string };
}

type SortOption = 'publishedAt' | 'views' | 'likes';
type SortOrder = 'desc' | 'asc';

const CATEGORIES = [
  'общие',
  'новости',
  'образование',
  'технологии',
  'arduino',
  'робототехника',
  'программирование',
  'diy',
];

const blogDesign = getBlogDesign();

export default function BlogPage({ params: { locale } }: BlogPageProps) {
  const currentLocale = locale as Locale;
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('publishedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [featuredBlogs, setFeaturedBlogs] = useState<IBlog[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const BLOGS_PER_PAGE = 12;

  // Загрузка блогов
  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: BLOGS_PER_PAGE.toString(),
        sortBy,
        sortOrder,
        published: 'true',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/blog?${params}`);
      if (!response.ok) throw new Error('Failed to fetch blogs');

      const data = await response.json();
      setBlogs(data.blogs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalBlogs(data.pagination?.totalBlogs || 0);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, searchTerm, selectedCategory]);

  // Загрузка рекомендуемых блогов
  const fetchFeaturedBlogs = useCallback(async () => {
    try {
      const response = await fetch('/api/blog/featured?limit=3');
      if (response.ok) {
        const data = await response.json();
        setFeaturedBlogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, [fetchFeaturedBlogs]);

  // Обработчики
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: SortOption) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(
      currentLocale === 'ru'
        ? 'ru-RU'
        : currentLocale === 'kk'
          ? 'kk-KZ'
          : 'en-US'
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  // Magazine Design
  if (blogDesign === 'magazine') {
    return (
      <MagazineBlogList
        locale={currentLocale}
        blogs={blogs}
        featuredBlogs={featuredBlogs}
        isLoading={isLoading}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        totalBlogs={totalBlogs}
        currentPage={currentPage}
        totalPages={totalPages}
        categories={CATEGORIES}
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onPageChange={setCurrentPage}
        onClearFilters={handleClearFilters}
      />
    );
  }

  // Default Design
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 font-fredoka text-4xl font-bold md:text-5xl">
              {t('blog.title', currentLocale)}
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200">
              {t('blog.description', currentLocale)}
            </p>
          </div>

          {/* Поиск */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder={t('blog.search.placeholder', currentLocale)}
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder-gray-300 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Рекомендуемые статьи */}
      {featuredBlogs.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('blog.featured', currentLocale)}
              </h2>
              <TrendingUp className="h-6 w-6 text-primary-500" />
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {featuredBlogs.map(blog => (
                <Link
                  key={blog._id}
                  href={`/${currentLocale}/blog/${blog.slug}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg group-hover:-translate-y-1">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={blog.previewImage}
                        alt={getLocalizedText(blog.title, currentLocale)}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full bg-primary-500 px-3 py-1 text-sm font-medium text-white">
                          {t('blog.featured', currentLocale)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
                        {truncateText(
                          getLocalizedText(blog.title, currentLocale),
                          80
                        )}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        {truncateText(
                          getLocalizedText(blog.excerpt, currentLocale),
                          120
                        )}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {blog.publishedAt && formatDate(blog.publishedAt)}
                          </span>
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Фильтры и сортировка */}
      <section className="border-b border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Мобильная кнопка фильтров */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 lg:hidden"
            >
              <Filter className="mr-2 h-4 w-4" />
              {t('blog.filters', currentLocale)}
            </button>

            {/* Фильтры */}
            <div
              className={`flex flex-col gap-4 sm:flex-row ${showFilters ? 'block' : 'hidden lg:flex'}`}
            >
              {/* Категории */}
              <select
                value={selectedCategory}
                onChange={e => handleCategoryChange(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
              >
                <option value="">
                  {t('blog.all.categories', currentLocale)}
                </option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Сортировка */}
            <div
              className={`flex flex-wrap gap-2 ${showFilters ? 'block' : 'hidden lg:flex'}`}
            >
              <button
                onClick={() => handleSortChange('publishedAt')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  sortBy === 'publishedAt'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('blog.sort.date', currentLocale)}
                {sortBy === 'publishedAt' && (
                  <span className="ml-1">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSortChange('views')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  sortBy === 'views'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('blog.sort.popular', currentLocale)}
                {sortBy === 'views' && (
                  <span className="ml-1">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSortChange('likes')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  sortBy === 'likes'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('blog.sort.liked', currentLocale)}
                {sortBy === 'likes' && (
                  <span className="ml-1">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>
            </div>

            {/* Счетчик */}
            <div className="text-sm text-gray-600">
              {totalBlogs} {t('blog.articles', currentLocale)}
            </div>
          </div>
        </div>
      </section>

      {/* Список блогов */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
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
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {blogs.map(blog => (
                <Link
                  key={blog._id}
                  href={`/${currentLocale}/blog/${blog.slug}`}
                  className="group"
                >
                  <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg group-hover:-translate-y-1">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={blog.previewImage}
                        alt={getLocalizedText(blog.title, currentLocale)}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {blog.category && (
                        <div className="absolute left-3 top-3">
                          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm">
                            {blog.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
                        {getLocalizedText(blog.title, currentLocale)}
                      </h2>
                      <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                        {getLocalizedText(blog.excerpt, currentLocale)}
                      </p>

                      {blog.tags && blog.tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                            >
                              <Tag className="mr-1 h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{blog.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {blog.publishedAt && formatDate(blog.publishedAt)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {blog.readingTime || 1}м
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
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
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto max-w-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  {t('blog.no.results.title', currentLocale)}
                </h3>
                <p className="mb-6 text-gray-600">
                  {t('blog.no.results.description', currentLocale)}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setCurrentPage(1);
                  }}
                  className="rounded-lg bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600"
                >
                  {t('blog.clear.filters', currentLocale)}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Пагинация */}
      {totalPages > 1 && (
        <section className="border-t border-gray-200 bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {t('blog.pagination.showing', currentLocale)}{' '}
                {(currentPage - 1) * BLOGS_PER_PAGE + 1} -{' '}
                {Math.min(currentPage * BLOGS_PER_PAGE, totalBlogs)}{' '}
                {t('blog.pagination.of', currentLocale)} {totalBlogs}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  {t('blog.pagination.previous', currentLocale)}
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('blog.pagination.next', currentLocale)}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
