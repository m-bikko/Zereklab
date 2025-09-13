'use client';

import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';

import Image from 'next/image';
import Link from 'next/link';

import { Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

export default function Footer() {
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/zereklab',
      icon: Instagram,
      color: 'hover:text-pink-500',
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/77753084648',
      icon: MessageCircle,
      color: 'hover:text-green-500',
    },
  ];

  const quickLinks = [
    { name: t('nav.about', locale), href: `/${locale}/about` },
    { name: t('nav.products', locale), href: `/${locale}/products` },
    { name: t('nav.contact', locale), href: `/${locale}/contact` },
    { name: t('footer.privacy', locale), href: `/${locale}/privacy` },
    { name: t('footer.terms', locale), href: `/${locale}/terms` },
  ];

  const categories = [
    {
      name: t('footer.categories.electronics', locale),
      href: `/${locale}/products?category=Электроника`,
    },
    {
      name: t('footer.categories.robotics', locale),
      href: `/${locale}/products?category=Робототехника`,
    },
    {
      name: t('footer.categories.programming', locale),
      href: `/${locale}/products?category=Программирование`,
    },
    {
      name: t('footer.categories.science', locale),
      href: `/${locale}/products?category=Наука`,
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center">
              <div className="relative flex h-16 w-auto items-center">
                <Image
                  src="/logo/zereklab.png"
                  alt={t('footer.logoAlt', locale)}
                  width={100}
                  height={40}
                  className="rounded-lg object-contain"
                  style={{ width: 'auto', height: '40px' }}
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-300">
              {t('footer.description', locale)}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(social => {
                const IconComponent = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 transition-colors duration-200 ${social.color}`}
                    aria-label={social.name}
                  >
                    <IconComponent className="h-6 w-6" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-primary-400">
              {t('footer.quickLinks', locale)}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors duration-200 hover:text-primary-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-primary-400">
              {t('footer.categoriesTitle', locale)}
            </h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-sm text-gray-300 transition-colors duration-200 hover:text-primary-400"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-primary-400">
              {t('footer.contactUs', locale)}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary-400" />
                <a
                  href="mailto:info@zereklab.com"
                  className="hover:text-primary-400"
                >
                  info@zereklab.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary-400" />
                <a href="tel:+77753084648" className="hover:text-primary-400">
                  +7 (775) 308-46-48
                </a>
              </div>
              <div className="flex items-start space-x-3 text-sm text-gray-300">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400" />
                <span>
                  {t('footer.address.street', locale)}
                  <br />
                  {t('footer.address.city', locale)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-center text-sm text-gray-400 sm:text-left">
              {t('footer.copyright', locale, { year: currentYear })}
            </p>
            <div className="flex items-center space-x-4 text-sm sm:space-x-6">
              <Link
                href={`/${locale}/privacy`}
                className="text-gray-400 transition-colors duration-200 hover:text-primary-400"
              >
                {t('footer.privacy', locale)}
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="text-gray-400 transition-colors duration-200 hover:text-primary-400"
              >
                {t('footer.terms', locale)}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
