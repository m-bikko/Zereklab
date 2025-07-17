// Import messages
import enMessages from '../messages/en.json';
import kkMessages from '../messages/kk.json';
import ruMessages from '../messages/ru.json';

// Simple i18n implementation without next-intl
export const locales = ['ru', 'kk', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ru';

export const localeNames = {
  ru: 'Русский',
  kk: 'Қазақша',
  en: 'English',
} as const;

const messages = {
  ru: ruMessages,
  kk: kkMessages,
  en: enMessages,
};

export function getMessages(locale: Locale = defaultLocale) {
  return messages[locale] || messages[defaultLocale];
}

export function t(
  key: string,
  locale: Locale = defaultLocale,
  params?: Record<string, string | number>
): string {
  const msgs = getMessages(locale);
  const keys = key.split('.');

  let value: unknown = msgs;
  for (const k of keys) {
    if (value && typeof value === 'object' && value !== null) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if not found
    }
  }

  let result = typeof value === 'string' ? value : key;

  // Replace parameters if provided
  if (params) {
    Object.entries(params).forEach(([param, paramValue]) => {
      result = result.replace(
        new RegExp(`\\{${param}\\}`, 'g'),
        String(paramValue)
      );
    });
  }

  return result;
}

// Hook for client components
export function useTranslations(locale: Locale = defaultLocale) {
  return (key: string, params?: Record<string, string | number>) =>
    t(key, locale, params);
}
