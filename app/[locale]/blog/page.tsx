'use client';

import { useState, useEffect, useCallback } from 'react';
import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';
import { type Locale, t } from '@/lib/i18n';
import { getBlogDesign } from '@/lib/blogDesign';
import MagazineBlogList from '@/components/blog/MagazineBlogList';

import Link from 'next/link';
import Image from 'next/image';

import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Search,
  Filter,
  Tag,
  ChevronLeft,
  ChevronRight,
  TrendingUp
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
  'diy'
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
        published: 'true'
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
    return new Date(date).toLocaleDateString(currentLocale === 'ru' ? 'ru-RU' : 
      currentLocale === 'kk' ? 'kk-KZ' : 'en-US');
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
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-fredoka mb-6">
              {t('blog.title', currentLocale)}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              {t('blog.description', currentLocale)}
            </p>
          </div>
          
          {/* Поиск */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('blog.search.placeholder', currentLocale)}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Рекомендуемые статьи */}
      {featuredBlogs.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('blog.featured', currentLocale)}
              </h2>
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <Link 
                  key={blog._id} 
                  href={`/${currentLocale}/blog/${blog.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={blog.previewImage}
                        alt={getLocalizedText(blog.title, currentLocale)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {t('blog.featured', currentLocale)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {truncateText(getLocalizedText(blog.title, currentLocale), 80)}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {truncateText(getLocalizedText(blog.excerpt, currentLocale), 120)}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {blog.publishedAt && formatDate(blog.publishedAt)}
                          </span>
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Фильтры и сортировка */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Мобильная кнопка фильтров */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('blog.filters', currentLocale)}
            </button>
            
            {/* Фильтры */}
            <div className={`flex flex-col sm:flex-row gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
              {/* Категории */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t('blog.all.categories', currentLocale)}</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Сортировка */}
            <div className={`flex flex-wrap gap-2 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
              <button
                onClick={() => handleSortChange('publishedAt')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'publishedAt'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('blog.sort.date', currentLocale)}
                {sortBy === 'publishedAt' && (
                  <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
              
              <button
                onClick={() => handleSortChange('views')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'views'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('blog.sort.popular', currentLocale)}
                {sortBy === 'views' && (
                  <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
              
              <button
                onClick={() => handleSortChange('likes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'likes'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('blog.sort.liked', currentLocale)}
                {sortBy === 'likes' && (
                  <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
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
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {blogs.map((blog) => (
                <Link 
                  key={blog._id} 
                  href={`/${currentLocale}/blog/${blog.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={blog.previewImage}
                        alt={getLocalizedText(blog.title, currentLocale)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {blog.category && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                            {blog.category}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h2 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {getLocalizedText(blog.title, currentLocale)}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {getLocalizedText(blog.excerpt, currentLocale)}
                      </p>
                      
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{blog.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {blog.publishedAt && formatDate(blog.publishedAt)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {blog.readingTime || 1}м
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
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
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('blog.no.results.title', currentLocale)}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('blog.no.results.description', currentLocale)}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setCurrentPage(1);
                  }}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
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
        <section className="py-8 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {t('blog.pagination.showing', currentLocale)} {((currentPage - 1) * BLOGS_PER_PAGE) + 1} - {Math.min(currentPage * BLOGS_PER_PAGE, totalBlogs)} {t('blog.pagination.of', currentLocale)} {totalBlogs}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
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
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
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
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('blog.pagination.next', currentLocale)}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}