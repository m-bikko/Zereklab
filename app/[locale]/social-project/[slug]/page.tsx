'use client';

import BeforeAfterSlider from '@/components/SocialProject/BeforeAfterSlider';
import { t } from '@/lib/i18n';
import { ISocialProject } from '@/models/SocialProject';
import { getLocalizedText } from '@/types';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { notFound } from 'next/navigation';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
} from 'lucide-react';

interface SocialProjectPageProps {
  params: { locale: string; slug: string };
}

export default function SocialProjectPage({
  params: { locale, slug },
}: SocialProjectPageProps) {
  const [project, setProject] = useState<ISocialProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(-1); // -1 is the main thumbnail

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/social-projects/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          // Handle 404
          if (response.status === 404) notFound();
        }
      } catch (error) {
        console.error('Failed to fetch social project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!project) return null;

  const lang = locale as 'ru' | 'kk' | 'en';
  const title = getLocalizedText(project.title, lang);
  const content = getLocalizedText(project.content, lang);
  const description = getLocalizedText(project.description, lang);

  // Combine main images and gallery for unified display
  const allImagePairs = [
    { beforeImage: project.beforeImage, afterImage: project.afterImage },
    ...(project.gallery || []),
  ];

  const currentPair =
    currentGalleryIndex === -1
      ? allImagePairs[0]
      : allImagePairs[currentGalleryIndex + 1];

  const handlePrev = () => {
    setCurrentGalleryIndex(prev => {
      if (prev === -1) return allImagePairs.length - 2;
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentGalleryIndex(prev => {
      if (prev === allImagePairs.length - 2) return -1;
      return prev + 1;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Breadcrumbs or Back button could go here */}

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="mb-10 text-center">
          <h1 className="mb-6 font-fredoka text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            {title}
          </h1>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {project.publishedAt &&
                new Date(project.publishedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              {project.views}
            </span>
          </div>

          {project.referenceLink && (
            <div className="mt-8">
              <a
                href={project.referenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl bg-primary-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-300 hover:bg-primary-700 hover:shadow-lg"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                {t('social.source', lang)}
              </a>
            </div>
          )}
        </header>

        {/* Before/After Slider */}
        <div className="mb-8 overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
          <BeforeAfterSlider
            beforeImage={currentPair.beforeImage}
            afterImage={currentPair.afterImage}
            beforeLabel={t('social.before', lang)}
            afterLabel={t('social.after', lang)}
            key={currentGalleryIndex} // Force re-render on index change
          />
        </div>

        {/* Gallery Navigation */}
        {allImagePairs.length > 1 && (
          <div className="mb-12 flex flex-col items-center">
            <div className="mb-4 flex w-full items-center justify-between gap-4 sm:justify-center">
              <button
                onClick={handlePrev}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-md transition-all hover:bg-primary-50 hover:text-primary-600"
                aria-label="Previous image pair"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="scrollbar-hide flex flex-1 flex-wrap justify-center gap-2 overflow-x-auto px-4 py-2 sm:flex-none">
                {allImagePairs.map((pair, idx) => {
                  const isActive =
                    (idx === 0 && currentGalleryIndex === -1) ||
                    idx === currentGalleryIndex + 1;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentGalleryIndex(idx - 1)}
                      className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        isActive
                          ? 'border-primary-500 ring-2 ring-primary-200 ring-offset-2'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={pair.afterImage}
                        alt={`Gallery thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-md transition-all hover:bg-primary-50 hover:text-primary-600"
                aria-label="Next image pair"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {/* Short Description */}
        <div className="prose prose-lg mb-10 max-w-none rounded-xl border border-gray-100 bg-white p-6 italic text-gray-600 shadow-sm">
          {description}
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-12">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </article>
    </div>
  );
}
