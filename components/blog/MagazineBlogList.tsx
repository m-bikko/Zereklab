'use client';

import { type Locale, t } from '@/lib/i18n';
import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  Bookmark,
  Calendar,
  Clock,
  Eye,
  Heart,
  Search,
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
  onClearFilters,
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
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="mb-4 text-5xl font-light tracking-tight text-gray-900 md:text-6xl">
            {t('blog.title', locale)}
          </h1>
          <p className="max-w-2xl text-xl font-light text-gray-500">
            {t('blog.description', locale)}
          </p>
        </div>
      </header>

      {/* Навигация по категориям */}
      <nav className="sticky top-16 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="scrollbar-hide flex items-center gap-8 overflow-x-auto py-4">
            <button
              onClick={() => onCategoryChange('')}
              className={`whitespace-nowrap text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'border-b-2 border-gray-900 pb-1 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t('blog.all.categories', locale)}
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`whitespace-nowrap text-sm font-medium capitalize transition-colors ${
                  selectedCategory === category
                    ? 'border-b-2 border-gray-900 pb-1 text-gray-900'
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
        <section className="mx-auto max-w-6xl px-4 py-12">
          <Link
            href={`/${locale}/blog/${featuredBlogs[0].slug}`}
            className="group block"
          >
            <article className="grid items-center gap-8 md:grid-cols-2">
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <Image
                  src={featuredBlogs[0].previewImage}
                  alt={getLocalizedText(featuredBlogs[0].title, locale)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="space-y-4">
                {featuredBlogs[0].category && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                    {featuredBlogs[0].category}
                  </span>
                )}
                <h2 className="text-3xl font-light leading-tight text-gray-900 transition-colors group-hover:text-primary-600 md:text-4xl">
                  {getLocalizedText(featuredBlogs[0].title, locale)}
                </h2>
                <p className="text-lg font-light leading-relaxed text-gray-600">
                  {getLocalizedText(featuredBlogs[0].excerpt, locale)}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {featuredBlogs[0].publishedAt && (
                    <span>{formatDate(featuredBlogs[0].publishedAt)}</span>
                  )}
                  <span>{featuredBlogs[0].readingTime || 5} min read</span>
                </div>
                <div className="flex items-center font-medium text-primary-600 transition-all group-hover:gap-3">
                  <span>{t('blog.readMore', locale)}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </article>
          </Link>

          {/* Secondary Featured */}
          {featuredBlogs.length > 1 && (
            <div className="mt-12 grid gap-8 border-t border-gray-100 pt-12 md:grid-cols-2">
              {featuredBlogs.slice(1, 3).map(blog => (
                <Link
                  key={blog._id}
                  href={`/${locale}/blog/${blog.slug}`}
                  className="group"
                >
                  <article className="flex gap-6">
                    <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden bg-gray-100">
                      <Image
                        src={blog.previewImage}
                        alt={getLocalizedText(blog.title, locale)}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      {blog.category && (
                        <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-600">
                          {blog.category}
                        </span>
                      )}
                      <h3 className="line-clamp-2 text-lg font-medium text-gray-900 transition-colors group-hover:text-primary-600">
                        {getLocalizedText(blog.title, locale)}
                      </h3>
                      <span className="mt-2 text-sm text-gray-500">
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
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="relative max-w-md">
          <Search className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('blog.search.placeholder', locale)}
            value={searchTerm}
            onChange={e => onSearch(e.target.value)}
            className="w-full border-b border-gray-200 bg-transparent py-3 pl-8 pr-4 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
          />
        </div>
      </section>

      {/* Blog Grid */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        {isLoading ? (
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-4 aspect-[3/2] bg-gray-200"></div>
                <div className="mb-3 h-3 w-20 bg-gray-200"></div>
                <div className="mb-2 h-5 bg-gray-200"></div>
                <div className="h-5 w-3/4 bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {totalBlogs} {t('blog.articles', locale)}
              </span>
            </div>

            <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
              {blogs.map(blog => (
                <Link
                  key={blog._id}
                  href={`/${locale}/blog/${blog.slug}`}
                  className="group"
                >
                  <article>
                    <div className="relative mb-4 aspect-[3/2] overflow-hidden bg-gray-100">
                      <Image
                        src={blog.previewImage}
                        alt={getLocalizedText(blog.title, locale)}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={e => e.preventDefault()}
                      >
                        <Bookmark className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>

                    {blog.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                        {blog.category}
                      </span>
                    )}

                    <h2 className="mb-2 mt-2 line-clamp-2 text-xl font-medium text-gray-900 transition-colors group-hover:text-primary-600">
                      {getLocalizedText(blog.title, locale)}
                    </h2>

                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                      {getLocalizedText(blog.excerpt, locale)}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {blog.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(blog.publishedAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {blog.readingTime || 3} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {blog.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {blog.likes || 0}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="mb-4 text-gray-500">
              {t('blog.no.results.title', locale)}
            </p>
            <button
              onClick={onClearFilters}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {t('blog.clear.filters', locale)}
            </button>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="mx-auto max-w-6xl border-t border-gray-100 px-4 py-12">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`flex h-10 w-10 items-center justify-center text-sm transition-colors ${
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
