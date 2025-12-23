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
  ArrowLeft,
  ExternalLink,
  Twitter,
  Facebook,
  Linkedin,
  Copy
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
  onLike
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.back', locale)}
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        {blog.category && (
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-4 block">
            {blog.category}
          </span>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
          {getLocalizedText(blog.title, locale)}
        </h1>

        <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed mb-8">
          {getLocalizedText(blog.excerpt, locale)}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-8 border-b border-gray-100">
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
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                  {blog.author.name.charAt(0)}
                </div>
              )}
              <span className="font-medium text-gray-900">{blog.author.name}</span>
            </div>
          )}

          {blog.publishedAt && (
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.publishedAt)}
            </span>
          )}

          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {blog.readingTime || 5} {t('blog.reading.time', locale)}
          </span>

          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {blog.views || 0}
          </span>
        </div>
      </header>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-4 mb-12">
        <div className="aspect-[21/9] relative overflow-hidden bg-gray-100">
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
      <article className="max-w-3xl mx-auto px-4">
        <div
          className="prose prose-lg prose-gray max-w-none
            prose-headings:font-light prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg
            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:font-semibold
            prose-blockquote:border-l-4 prose-blockquote:border-gray-900 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-xl prose-blockquote:font-light
            prose-ul:text-gray-700 prose-ol:text-gray-700
            prose-img:rounded-none"
          dangerouslySetInnerHTML={{
            __html: getLocalizedText(blog.content, locale)
          }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-gray-100">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Sources */}
        {blog.sources && blog.sources.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Sources
            </h3>
            <div className="space-y-2">
              {blog.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{source.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
          <button
            onClick={onLike}
            disabled={isLiking || hasLiked}
            className={`flex items-center gap-2 px-6 py-3 transition-colors ${
              hasLiked
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{blog.likes || 0}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              title="Copy link"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </button>
          </div>
        </div>
      </article>

      {/* Media Gallery */}
      {blog.media && blog.media.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 mt-16">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">
            {t('blog.media', locale)}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {blog.media.map((media, index) => (
              <div key={index} className="aspect-video relative overflow-hidden bg-gray-100">
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
                    className="w-full h-full"
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
        <section className="max-w-5xl mx-auto px-4 mt-20 pt-12 border-t border-gray-100">
          <h2 className="text-2xl font-light text-gray-900 mb-8">
            {t('blog.related', locale)}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {blog.relatedPosts.map((post) => (
              <Link key={post._id} href={`/${locale}/blog/${post.slug}`} className="group">
                <article>
                  <div className="aspect-[3/2] relative overflow-hidden bg-gray-100 mb-4">
                    <Image
                      src={post.previewImage}
                      alt={getLocalizedText(post.title, locale)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {getLocalizedText(post.title, locale)}
                  </h3>
                  <span className="text-sm text-gray-500 mt-2 block">
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
        <section className="max-w-5xl mx-auto px-4 mt-16 mb-20 pt-12 border-t border-gray-100">
          <h2 className="text-2xl font-light text-gray-900 mb-8">
            {t('blog.latest', locale)}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {recentBlogs.slice(0, 4).map((post) => (
              <Link key={post._id} href={`/${locale}/blog/${post.slug}`} className="group">
                <article>
                  <div className="aspect-square relative overflow-hidden bg-gray-100 mb-3">
                    <Image
                      src={post.previewImage}
                      alt={getLocalizedText(post.title, locale)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
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
