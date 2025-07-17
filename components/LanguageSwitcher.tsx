'use client';

import { type Locale, localeNames, locales } from '@/lib/i18n';

import { useState, useTransition } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';

import ClientOnly from './ClientOnly';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export default function LanguageSwitcher({
  currentLocale,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: Locale) => {
    startTransition(() => {
      // Remove current locale from pathname and add new one
      const segments = pathname.split('/');
      if (locales.includes(segments[1] as Locale)) {
        segments[1] = newLocale;
      } else {
        segments.unshift('', newLocale);
      }

      const newPath = segments.join('/') || `/${newLocale}`;
      router.push(newPath);
      setIsOpen(false);
    });
  };

  return (
    <ClientOnly
      fallback={
        <div className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
          <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
        </div>
      }
    >
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
          <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              >
                {locales.map(loc => (
                  <button
                    key={loc}
                    onClick={() => switchLanguage(loc)}
                    disabled={isPending}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 disabled:opacity-50 ${
                      currentLocale === loc
                        ? 'bg-primary-50 font-medium text-primary-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="mr-3 text-base">
                      {loc === 'ru' && '🇷🇺'}
                      {loc === 'kk' && '🇰🇿'}
                      {loc === 'en' && '🇺🇸'}
                    </span>
                    {localeNames[loc]}
                    {currentLocale === loc && (
                      <span className="ml-auto text-primary-600">✓</span>
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ClientOnly>
  );
}
