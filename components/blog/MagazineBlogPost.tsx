'use client';

import { type Locale, t } from '@/lib/i18n';
import { IBlog } from '@/models/Blog';
import { getLocalizedText } from '@/types';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Facebook,
  Heart,
  Linkedin,
  Twitter,
} from 'lucide-react';

interface BlogWithRelated extends Omit<IBlog, 'relatedPosts'> {
  relatedPosts?: IBlog[];
}

interface MagazineBlogPostProps {
  locale: Locale;
  blog: BlogWithRelated;
  recentBlogs: IBlog[];
  hasLiked: boolean;
  isLiking: boolean;
  onLike: () => void;
}

export default function MagazineBlogPost({
  locale,
  blog,
  recentBlogs,
  hasLiked,
  isLiking,
  onLike,
}: MagazineBlogPostProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : locale === 'kk' ? 'kk-KZ' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('blog.back', locale)}
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <header className="mx-auto max-w-4xl px-4 pb-8 pt-12">
        {blog.category && (
          <span className="mb-4 block text-xs font-semibold uppercase tracking-wider text-primary-600">
            {blog.category}
          </span>
        )}

        <h1 className="mb-6 text-4xl font-light leading-tight text-gray-900 md:text-5xl lg:text-6xl">
          {getLocalizedText(blog.title, locale)}
        </h1>

        <p className="mb-8 text-xl font-light leading-relaxed text-gray-500 md:text-2xl">
          {getLocalizedText(blog.excerpt, locale)}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 border-b border-gray-100 pb-8 text-sm text-gray-500">
          {blog.author && (
            <div className="flex items-center gap-3">
              {blog.author.avatar ? (
                <Image
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600">
                  {blog.author.name.charAt(0)}
                </div>
              )}
              <span className="font-medium text-gray-900">
                {blog.author.name}
              </span>
            </div>
          )}

          {blog.publishedAt && (
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(blog.publishedAt)}
            </span>
          )}

          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {blog.readingTime || 5} {t('blog.reading.time', locale)}
          </span>

          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {blog.views || 0}
          </span>
        </div>
      </header>

      {/* Featured Image */}
      <div className="mx-auto mb-12 max-w-5xl px-4">
        <div className="relative aspect-[21/9] overflow-hidden bg-gray-100">
          <Image
            src={blog.previewImage}
            alt={getLocalizedText(blog.title, locale)}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <article className="mx-auto max-w-3xl px-4">
        <div
          className="prose prose-lg prose-gray max-w-none prose-headings:font-light prose-headings:tracking-tight prose-h2:mb-6 prose-h2:mt-12 prose-h2:text-3xl prose-h3:mb-4 prose-h3:mt-10 prose-h3:text-2xl prose-p:text-lg prose-p:leading-relaxed prose-p:text-gray-700 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-gray-900 prose-blockquote:pl-6 prose-blockquote:text-xl prose-blockquote:font-light prose-blockquote:italic prose-strong:font-semibold prose-ol:text-gray-700 prose-ul:text-gray-700 prose-img:rounded-none"
          dangerouslySetInnerHTML={{
            __html: getLocalizedText(blog.content, locale),
          }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-gray-100 pt-8">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="cursor-pointer bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Sources */}
        {blog.sources && blog.sources.length > 0 && (
          <div className="mt-12 border-t border-gray-100 pt-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Sources
            </h3>
            <div className="space-y-2">
              {blog.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 transition-colors hover:text-primary-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{source.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-8">
          <button
            onClick={onLike}
            disabled={isLiking || hasLiked}
            className={`flex items-center gap-2 px-6 py-3 transition-colors ${
              hasLiked
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{blog.likes || 0}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="bg-gray-100 p-3 text-gray-700 transition-colors hover:bg-gray-200"
              title="Copy link"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                  '_blank'
                )
              }
              className="bg-gray-100 p-3 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Twitter className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                  '_blank'
                )
              }
              className="bg-gray-100 p-3 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Facebook className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`,
                  '_blank'
                )
              }
              className="bg-gray-100 p-3 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Linkedin className="h-5 w-5" />
            </button>
          </div>
        </div>
      </article>

      {/* Media Gallery */}
      {blog.media && blog.media.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl px-4">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
            {t('blog.media', locale)}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {blog.media.map((media, index) => (
              <div
                key={index}
                className="relative aspect-video overflow-hidden bg-gray-100"
              >
                {media.type === 'image' ? (
                  <Image
                    src={media.url}
                    alt={media.alt || ''}
                    fill
                    className="object-cover"
                  />
                ) : media.type === 'video' ? (
                  <iframe
                    src={media.url}
                    title={media.alt || 'Video'}
                    className="h-full w-full"
                    allowFullScreen
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Posts */}
      {blog.relatedPosts && blog.relatedPosts.length > 0 && (
        <section className="mx-auto mt-20 max-w-5xl border-t border-gray-100 px-4 pt-12">
          <h2 className="mb-8 text-2xl font-light text-gray-900">
            {t('blog.related', locale)}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {blog.relatedPosts.map(post => (
              <Link
                key={post._id}
                href={`/${locale}/blog/${post.slug}`}
                className="group"
              >
                <article>
                  <div className="relative mb-4 aspect-[3/2] overflow-hidden bg-gray-100">
                    <Image
                      src={post.previewImage}
                      alt={getLocalizedText(post.title, locale)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-primary-600">
                    {getLocalizedText(post.title, locale)}
                  </h3>
                  <span className="mt-2 block text-sm text-gray-500">
                    {post.publishedAt && formatDate(post.publishedAt)}
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      {recentBlogs.length > 0 && (
        <section className="mx-auto mb-20 mt-16 max-w-5xl border-t border-gray-100 px-4 pt-12">
          <h2 className="mb-8 text-2xl font-light text-gray-900">
            {t('blog.latest', locale)}
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {recentBlogs.slice(0, 4).map(post => (
              <Link
                key={post._id}
                href={`/${locale}/blog/${post.slug}`}
                className="group"
              >
                <article>
                  <div className="relative mb-3 aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={post.previewImage}
                      alt={getLocalizedText(post.title, locale)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-primary-600">
                    {getLocalizedText(post.title, locale)}
                  </h3>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
