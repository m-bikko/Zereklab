'use client';

import ContactForm from '@/components/SocialProject/ContactForm';
// Function to get text by locale
import { t } from '@/lib/i18n';
import { ISocialProject } from '@/models/SocialProject';
// We'll need to export this interface from models or types
import { getLocalizedText } from '@/types';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight, Calendar } from 'lucide-react';

interface SocialProjectsPageProps {
  params: { locale: string };
}

export default function SocialProjectsPage({
  params: { locale },
}: SocialProjectsPageProps) {
  const lang = locale as 'ru' | 'kk' | 'en';
  const [projects, setProjects] = useState<ISocialProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `/api/social-projects?published=true&sortOrder=desc`
        );
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Failed to fetch social projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(
      lang === 'ru' ? 'ru-RU' : lang === 'kk' ? 'kk-KZ' : 'en-US'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 font-fredoka text-4xl font-bold md:text-5xl">
            {t('social.title', lang)}
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-primary-100">
            {t('social.subtitle', lang)}
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <ContactForm locale={lang} />

      {/* Projects List */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-6">
                    <div className="mb-4 h-6 w-3/4 rounded bg-gray-200" />
                    <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map(project => (
                <Link
                  key={project._id}
                  href={`/${locale}/social-project/${project.slug}`}
                  className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={project.afterImage} // Show "After" image as preview
                      alt={getLocalizedText(project.title, lang)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="flex items-center font-medium text-white">
                        {t('common.readmore', lang)}{' '}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center text-sm text-gray-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(project.publishedAt)}
                    </div>
                    <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary-600">
                      {getLocalizedText(project.title, lang)}
                    </h3>
                    <p className="mb-4 line-clamp-3 text-gray-600">
                      {getLocalizedText(project.description, lang)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-500">{t('social.empty', lang)}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
