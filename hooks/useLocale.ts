'use client';

import { type Locale, defaultLocale, locales } from '@/lib/i18n';

import { usePathname } from 'next/navigation';

export function useLocale(): Locale {
  const pathname = usePathname();

  // Extract locale from pathname
  const segments = pathname.split('/');
  const localeFromPath = segments[1];

  // Check if the locale is valid
  if (locales.includes(localeFromPath as Locale)) {
    return localeFromPath as Locale;
  }

  return defaultLocale;
}
