'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/zereklab',
      icon: Instagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/zereklab',
      icon: Facebook,
      color: 'hover:text-blue-600'
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/71234567890',
      icon: MessageCircle,
      color: 'hover:text-green-500'
    }
  ]

  const quickLinks = [
    { name: 'О нас', href: '/about' },
    { name: 'Товары', href: '/products' },
    { name: 'Контакты', href: '/contact' },
    { name: 'Политика конфиденциальности', href: '/privacy' },
    { name: 'Условия использования', href: '/terms' }
  ]

  const categories = [
    { name: 'Электроника', href: '/products?category=Электроника' },
    { name: 'Робототехника', href: '/products?category=Робототехника' },
    { name: 'Программирование', href: '/products?category=Программирование' },
    { name: 'Наука', href: '/products?category=Наука' },
  ]

  return (
    <footer className="bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo/zereklab.jpg"
                  alt="Логотип ZerekLab"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="font-bold text-2xl">ZerekLab</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Вдохновляем детей с помощью практических образовательных наборов. 
              Создаем будущее поколение инноваторов и изобретателей.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 transition-colors duration-200 ${social.color}`}
                    aria-label={social.name}
                  >
                    <IconComponent className="w-6 h-6" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-primary-400">Быстрые ссылки</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-primary-400">Категории</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-primary-400">Свяжитесь с нами</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:info@zereklab.com" className="hover:text-primary-400">info@zereklab.com</a>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="tel:+71234567890" className="hover:text-primary-400">+7 (123) 456-7890</a>
              </div>
              <div className="flex items-start space-x-3 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>ул. Инновационная 123<br />Техноград, KZ 050000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} ZerekLab. Все права защищены.
            </p>
            <div className="flex items-center space-x-4 sm:space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 