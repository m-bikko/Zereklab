'use client';

import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';
import { useCartStore } from '@/store/cartStore';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Menu, Search, ShoppingCart, X } from 'lucide-react';

import CartModal from './CartModal';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const locale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems, toggleCart } = useCartStore();
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Subscribe to cart updates
    const unsubscribe = useCartStore.subscribe(state =>
      setTotalItems(state.getTotalItems())
    );
    setTotalItems(getTotalItems()); // Initial count
    return unsubscribe; // Unsubscribe on component unmount
  }, [getTotalItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/${locale}/products?search=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchQuery('');
      if (isMenuOpen) setIsMenuOpen(false); // Close mobile menu on search
    }
  };

  const navLinks = [
    { href: `/${locale}`, label: t('nav.home', locale) },
    { href: `/${locale}/products`, label: t('nav.products', locale) },
    { href: `/${locale}/blog`, label: t('nav.blog', locale) },
    { href: `/${locale}/about`, label: t('nav.about', locale) },
    { href: `/${locale}/contact`, label: t('nav.contact', locale) },
    // { href: `/${locale}/admin`, label: t('nav.admin', locale) } // Admin link
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative flex h-12 w-auto items-center">
                <Image
                  src="/logo/zereklab.jpg"
                  alt="Логотип ZEREKlab"
                  width={80}
                  height={32}
                  className="rounded-lg object-contain"
                  style={{ width: 'auto', height: '32px' }}
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-8 md:flex">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-fredoka font-medium text-gray-700 transition-colors duration-200 hover:text-primary-500"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="mx-4 hidden max-w-xs flex-1 items-center sm:flex lg:max-w-sm"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={t('common.search', locale)}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-300 bg-gray-100 px-4 py-2 pl-10 pr-10 text-sm text-gray-700 transition-colors duration-200 focus:border-primary-500 focus:bg-white focus:outline-none"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <button
                  type="submit"
                  aria-label="Поиск"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 transform rounded-full bg-primary-500 p-1.5 text-white transition-colors duration-200 hover:bg-primary-600"
                >
                  <Search className="h-3 w-3" />
                </button>
              </div>
            </form>

            {/* Language Switcher, Cart and Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher currentLocale={locale} />

              {/* Cart Button */}
              <button
                onClick={toggleCart}
                aria-label={t('nav.cart', locale)}
                className="relative p-2 text-gray-700 transition-colors duration-200 hover:text-primary-500"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 min-w-[20px] items-center justify-center rounded-full bg-primary-500 px-1 text-xs font-semibold text-white shadow-md">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                className="p-2 text-gray-700 transition-colors duration-200 hover:text-primary-500 md:hidden"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar and Navigation Menu Wrapper*/}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="border-t border-gray-200 py-3">
              {/* Mobile Search Bar */}
              <form onSubmit={handleSearch} className="relative mb-3 px-4">
                <input
                  type="text"
                  placeholder={t('common.search', locale)}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-300 bg-gray-100 px-4 py-2.5 pl-10 pr-12 text-sm text-gray-700 focus:border-primary-500 focus:bg-white focus:outline-none"
                />
                <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <button
                  type="submit"
                  aria-label="Поиск"
                  className="absolute right-6 top-1/2 -translate-y-1/2 transform rounded-full bg-primary-500 p-1.5 text-white hover:bg-primary-600"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Mobile Navigation Menu */}
              <div className="flex flex-col space-y-1 px-2">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 font-fredoka text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-primary-500"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <CartModal />
    </>
  );
}
