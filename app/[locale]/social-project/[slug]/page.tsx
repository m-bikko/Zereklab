'use client';

import BeforeAfterSlider from '@/components/SocialProject/BeforeAfterSlider';
import { t } from '@/lib/i18n';
import { ISocialProject } from '@/models/SocialProject';
import { getLocalizedText } from '@/types';

import { useEffect, useState } from 'react';

import { notFound } from 'next/navigation';

import { Calendar, ExternalLink, Eye } from 'lucide-react';

interface SocialProjectPageProps {
  params: { locale: string; slug: string };
}

export default function SocialProjectPage({
  params: { locale, slug },
}: SocialProjectPageProps) {
  const [project, setProject] = useState<ISocialProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="mb-12 overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
          <BeforeAfterSlider
            beforeImage={project.beforeImage}
            afterImage={project.afterImage}
            beforeLabel={t('social.before', lang)}
            afterLabel={t('social.after', lang)}
          />
        </div>

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
