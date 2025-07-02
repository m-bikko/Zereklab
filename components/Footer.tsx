'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

export default function Footer() {
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
      href: 'https://wa.me/71234567890',
      icon: MessageCircle,
      color: 'hover:text-green-500',
    },
  ];

  const quickLinks = [
    { name: 'О нас', href: '/about' },
    { name: 'Товары', href: '/products' },
    { name: 'Контакты', href: '/contact' },
    { name: 'Политика конфиденциальности', href: '/privacy' },
    { name: 'Условия использования', href: '/terms' },
  ];

  const categories = [
    { name: 'Электроника', href: '/products?category=Электроника' },
    { name: 'Робототехника', href: '/products?category=Робототехника' },
    { name: 'Программирование', href: '/products?category=Программирование' },
    { name: 'Наука', href: '/products?category=Наука' },
  ];

  return (
    <footer className="bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <div className="relative flex h-16 w-auto items-center">
                <Image
                  src="/logo/zereklab.png"
                  alt="Логотип ZerekLab"
                  width={140}
                  height={64}
                  className="rounded-lg object-contain"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-300">
              Вдохновляем детей с помощью практических образовательных наборов.
              Создаем будущее поколение инноваторов и изобретателей.
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
              Быстрые ссылки
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
              Категории
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
              Свяжитесь с нами
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
                <a href="tel:+71234567890" className="hover:text-primary-400">
                  +7 (123) 456-7890
                </a>
              </div>
              <div className="flex items-start space-x-3 text-sm text-gray-300">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400" />
                <span>
                  ул. Инновационная 123
                  <br />
                  Техноград, KZ 050000
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-center text-sm text-gray-400 sm:text-left">
              © {currentYear} ZerekLab. Все права защищены.
            </p>
            <div className="flex items-center space-x-4 text-sm sm:space-x-6">
              <Link
                href="/privacy"
                className="text-gray-400 transition-colors duration-200 hover:text-primary-400"
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 transition-colors duration-200 hover:text-primary-400"
              >
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
