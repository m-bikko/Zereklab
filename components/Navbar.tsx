'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import CartModal from './CartModal'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { getTotalItems, toggleCart } = useCartStore()
  const [totalItems, setTotalItems] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Subscribe to cart updates
    const unsubscribe = useCartStore.subscribe(
      (state) => setTotalItems(state.getTotalItems())
    )
    setTotalItems(getTotalItems()) // Initial count
    return unsubscribe // Unsubscribe on component unmount
  }, [getTotalItems])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      if(isMenuOpen) setIsMenuOpen(false) // Close mobile menu on search
    }
  }

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/products', label: 'Товары' },
    { href: '/about', label: 'О нас' },
    { href: '/contact', label: 'Контакты' }
    // { href: '/admin', label: 'Админ' } // Admin link was removed previously
  ]

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo/zereklab.jpg"
                  alt="Логотип ZerekLab"
                  fill
                  className="object-contain rounded-lg"
                  priority
                />
              </div>
              <span className="font-bold text-xl text-secondary-700">
                ZerekLab
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-primary-500 font-medium transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-xs lg:max-w-sm mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-10 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:border-primary-500 focus:bg-white transition-colors duration-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <button
                  type="submit"
                  aria-label="Поиск"
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white p-1.5 rounded-full hover:bg-primary-600 transition-colors duration-200"
                >
                  <Search className="w-3 h-3" />
                </button>
              </div>
            </form>

            {/* Cart and Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Cart Button */}
              <button
                onClick={toggleCart}
                aria-label="Открыть корзину"
                className="relative p-2 text-gray-700 hover:text-primary-500 transition-colors duration-200"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
                className="md:hidden p-2 text-gray-700 hover:text-primary-500 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar and Navigation Menu Wrapper*/}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="border-t border-gray-200 py-3">
              {/* Mobile Search Bar */}
              <form onSubmit={handleSearch} className="relative px-4 mb-3">
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 pr-12 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:border-primary-500 focus:bg-white"
                />
                <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <button
                  type="submit"
                  aria-label="Поиск"
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white p-1.5 rounded-full hover:bg-primary-600"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Mobile Navigation Menu */}
              <div className="flex flex-col space-y-1 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-primary-500 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-base"
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
  )
} 