'use client';

import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';
import { type Locale, t } from '@/lib/i18n';

import Link from 'next/link';
import Image from 'next/image';

import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Search,
  ArrowRight,
  Bookmark
} from 'lucide-react';

interface MagazineBlogListProps {
  locale: Locale;
  blogs: IBlog[];
  featuredBlogs: IBlog[];
  isLoading: boolean;
  searchTerm: string;
  selectedCategory: string;
  totalBlogs: number;
  currentPage: number;
  totalPages: number;
  categories: string[];
  onSearch: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

export default function MagazineBlogList({
  locale,
  blogs,
  featuredBlogs,
  isLoading,
  searchTerm,
  selectedCategory,
  totalBlogs,
  currentPage,
  totalPages,
  categories,
  onSearch,
  onCategoryChange,
  onPageChange,
  onClearFilters
}: MagazineBlogListProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : locale === 'kk' ? 'kk-KZ' : 'en-US',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Минималистичный Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 tracking-tight mb-4">
            {t('blog.title', locale)}
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-2xl">
            {t('blog.description', locale)}
          </p>
        </div>
      </header>

      {/* Навигация по категориям */}
      <nav className="border-b border-gray-100 sticky top-16 bg-white/95 backdrop-blur-sm z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-8 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => onCategoryChange('')}
              className={`whitespace-nowrap text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t('blog.all.categories', locale)}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`whitespace-nowrap text-sm font-medium transition-colors capitalize ${
                  selectedCategory === category
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Featured Post */}
      {featuredBlogs.length > 0 && !searchTerm && !selectedCategory && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <Link href={`/${locale}/blog/${featuredBlogs[0].slug}`} className="group block">
            <article className="grid md:grid-cols-2 gap-8 items-center">
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                <Image
                  src={featuredBlogs[0].previewImage}
                  alt={getLocalizedText(featuredBlogs[0].title, locale)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
              <div className="space-y-4">
                {featuredBlogs[0].category && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                    {featuredBlogs[0].category}
                  </span>
                )}
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight group-hover:text-primary-600 transition-colors">
                  {getLocalizedText(featuredBlogs[0].title, locale)}
                </h2>
                <p className="text-lg text-gray-600 font-light leading-relaxed">
                  {getLocalizedText(featuredBlogs[0].excerpt, locale)}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {featuredBlogs[0].publishedAt && (
                    <span>{formatDate(featuredBlogs[0].publishedAt)}</span>
                  )}
                  <span>{featuredBlogs[0].readingTime || 5} min read</span>
                </div>
                <div className="flex items-center text-primary-600 font-medium group-hover:gap-3 transition-all">
                  <span>{t('blog.readMore', locale)}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </article>
          </Link>

          {/* Secondary Featured */}
          {featuredBlogs.length > 1 && (
            <div className="grid md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-gray-100">
              {featuredBlogs.slice(1, 3).map((blog) => (
                <Link key={blog._id} href={`/${locale}/blog/${blog.slug}`} className="group">
                  <article className="flex gap-6">
                    <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden bg-gray-100">
                      <Image
                        src={blog.previewImage}
                        alt={getLocalizedText(blog.title, locale)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      {blog.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
                          {blog.category}
                        </span>
                      )}
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {getLocalizedText(blog.title, locale)}
                      </h3>
                      <span className="text-sm text-gray-500 mt-2">
                        {blog.publishedAt && formatDate(blog.publishedAt)}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Search */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="relative max-w-md">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('blog.search.placeholder', locale)}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-200 focus:border-gray-900 outline-none text-gray-900 placeholder-gray-400 transition-colors"
          />
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/2] bg-gray-200 mb-4"></div>
                <div className="h-3 bg-gray-200 w-20 mb-3"></div>
                <div className="h-5 bg-gray-200 mb-2"></div>
                <div className="h-5 bg-gray-200 w-3/4"></div>
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm text-gray-500">
                {totalBlogs} {t('blog.articles', locale)}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
              {blogs.map((blog) => (
                <Link key={blog._id} href={`/${locale}/blog/${blog.slug}`} className="group">
                  <article>
                    <div className="aspect-[3/2] relative overflow-hidden bg-gray-100 mb-4">
                      <Image
                        src={blog.previewImage}
                        alt={getLocalizedText(blog.title, locale)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Bookmark className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>

                    {blog.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                        {blog.category}
                      </span>
                    )}

                    <h2 className="text-xl font-medium text-gray-900 mt-2 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {getLocalizedText(blog.title, locale)}
                    </h2>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {getLocalizedText(blog.excerpt, locale)}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {blog.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.publishedAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blog.readingTime || 3} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {blog.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {blog.likes || 0}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">{t('blog.no.results.title', locale)}</p>
            <button
              onClick={onClearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('blog.clear.filters', locale)}
            </button>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 flex items-center justify-center text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
