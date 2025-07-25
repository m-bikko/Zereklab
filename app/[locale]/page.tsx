'use client';

import ClientOnly from '@/components/ClientOnly';
import DailyImageRotation from '@/components/DailyImageRotation';
import { type Locale, t } from '@/lib/i18n';

import { useRef } from 'react';

import Link from 'next/link';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import {
  BookOpen,
  Brain,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Rocket,
  Star,
  Wrench,
} from 'lucide-react';

// Simplified animation variants for better performance
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

// Optimized animated section component
const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  const currentLocale = locale as Locale;

  const benefits = [
    {
      icon: Lightbulb,
      title: t('home.benefits.creativity.title', currentLocale),
      description: t('home.benefits.creativity.description', currentLocale),
    },
    {
      icon: Rocket,
      title: t('home.benefits.future.title', currentLocale),
      description: t('home.benefits.future.description', currentLocale),
    },
    {
      icon: BookOpen,
      title: t('home.benefits.learning.title', currentLocale),
      description: t('home.benefits.learning.description', currentLocale),
    },
    {
      icon: GraduationCap,
      title: t('home.benefits.support.title', currentLocale),
      description: t('home.benefits.support.description', currentLocale),
    },
  ];

  const testimonials = [
    {
      name: t('home.testimonials.testimonial1.name', currentLocale),
      role: t('home.testimonials.testimonial1.role', currentLocale),
      content: t('home.testimonials.testimonial1.content', currentLocale),
      rating: 5,
    },
    {
      name: t('home.testimonials.testimonial2.name', currentLocale),
      role: t('home.testimonials.testimonial2.role', currentLocale),
      content: t('home.testimonials.testimonial2.content', currentLocale),
      rating: 5,
    },
    {
      name: t('home.testimonials.testimonial3.name', currentLocale),
      role: t('home.testimonials.testimonial3.role', currentLocale),
      content: t('home.testimonials.testimonial3.content', currentLocale),
      rating: 5,
    },
  ];

  const stats = [
    { number: '10,000+', label: t('home.stats.children', currentLocale) },
    { number: '500+', label: t('home.stats.schools', currentLocale) },
    { number: '50+', label: t('home.stats.kits', currentLocale) },
    { number: '99%', label: t('home.stats.satisfaction', currentLocale) },
  ];

  const featuredCategories = [
    {
      title: t('home.categories.electronics.title', currentLocale),
      description: t('home.categories.electronics.description', currentLocale),
      image: '/images/electronics-category.jpg',
      href: `/${currentLocale}/products?category=Электроника`,
      icon: Wrench,
    },
    {
      title: t('home.categories.robotics.title', currentLocale),
      description: t('home.categories.robotics.description', currentLocale),
      image: '/images/robotics-category.jpg',
      href: `/${currentLocale}/products?category=Робототехника`,
      icon: Rocket,
    },
    {
      title: t('home.categories.programming.title', currentLocale),
      description: t('home.categories.programming.description', currentLocale),
      image: '/images/programming-category.jpg',
      href: `/${currentLocale}/products?category=Программирование`,
      icon: Brain,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <ClientOnly
        fallback={
          <section className="relative overflow-hidden bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div className="text-center lg:text-left">
                  <h1 className="mb-6 font-fredoka text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                    {t('home.hero.title1', currentLocale)}
                    <span className="block font-fredoka text-primary-400">
                      {t('home.hero.title2', currentLocale)}
                    </span>
                    {t('home.hero.title3', currentLocale)}
                  </h1>
                  <p className="mb-8 text-xl leading-relaxed text-gray-200 sm:text-2xl">
                    {t('home.hero.description', currentLocale)}
                  </p>
                  <div className="starter-button flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <Link
                      href={`/${currentLocale}/products`}
                      className="group flex w-full items-center justify-center rounded-lg bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-600 hover:shadow-xl sm:w-auto"
                    >
                      {t('home.hero.allKits', currentLocale)}
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      href={`/${currentLocale}/about`}
                      className="flex w-full items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white hover:text-secondary-700 sm:w-auto"
                    >
                      {t('home.hero.learnMore', currentLocale)}
                    </Link>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 opacity-80"></div>
                </div>
              </div>
            </div>
          </section>
        }
      >
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <motion.div
                className="text-center lg:text-left"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <motion.h1
                  className="mb-6 font-fredoka text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                >
                  {t('home.hero.title1', currentLocale)}
                  <motion.span
                    className="block font-fredoka text-primary-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                  >
                    {t('home.hero.title2', currentLocale)}
                  </motion.span>
                  {t('home.hero.title3', currentLocale)}
                </motion.h1>
                <motion.p
                  className="mb-8 text-xl leading-relaxed text-gray-200 sm:text-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                >
                  {t('home.hero.description', currentLocale)}
                </motion.p>
                <motion.div
                  className="starter-button flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/${currentLocale}/products`}
                      className="group flex w-full items-center justify-center rounded-lg bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-600 hover:shadow-xl sm:w-auto"
                    >
                      {t('home.hero.allKits', currentLocale)}
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/${currentLocale}/about`}
                      className="flex w-full items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white hover:text-secondary-700 sm:w-auto"
                    >
                      {t('home.hero.learnMore', currentLocale)}
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Daily Image Rotation */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              >
                <DailyImageRotation />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <AnimatedSection>
          <section className="bg-gray-50 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    whileHover={{ scale: 1.02 }}
                    className="transform rounded-xl bg-white p-6 text-center shadow-lg transition-all duration-200"
                  >
                    <motion.div
                      className="mb-1 font-fredoka text-3xl font-bold text-primary-500 sm:mb-2 sm:text-4xl"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                      viewport={{ once: true }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-sm font-medium text-gray-600 sm:text-base">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </AnimatedSection>

        {/* Benefits Section */}
        <AnimatedSection>
          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                className="mb-12 text-center sm:mb-16"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <h2 className="mb-3 font-fredoka text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
                  {t('home.benefits.title', currentLocale)}
                </h2>
                <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
                  {t('home.benefits.description', currentLocale)}
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="transform rounded-xl bg-gray-50 p-6 text-center shadow-lg transition-all duration-200"
                    >
                      <motion.div
                        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md sm:mb-6 sm:h-20 sm:w-20"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <IconComponent className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                      </motion.div>
                      <h3 className="mb-2 font-fredoka text-xl font-semibold text-gray-900 sm:mb-3">
                        {benefit.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                        {benefit.description}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>
        </AnimatedSection>

        {/* Featured Categories Section */}
        <AnimatedSection>
          <section className="bg-gradient-to-br from-gray-100 to-gray-200 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                className="mb-12 text-center sm:mb-16"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <h2 className="mb-3 font-fredoka text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
                  {t('home.categories.title', currentLocale)}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
                  {t('home.categories.description', currentLocale)}
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 gap-8 md:grid-cols-3"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {featuredCategories.map((category, index) => {
                  const CategoryIcon = category.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group block"
                    >
                      <Link href={category.href}>
                        <div className="flex h-full transform flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-200 group-hover:shadow-xl">
                          <motion.div
                            className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-500 sm:h-56"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CategoryIcon className="h-16 w-16 text-white opacity-90 sm:h-20 sm:w-20" />
                            </motion.div>
                          </motion.div>
                          <div className="flex flex-grow flex-col p-6">
                            <motion.h3 className="mb-2 font-fredoka text-xl font-semibold text-gray-900 transition-colors group-hover:text-primary-600 sm:text-2xl">
                              {category.title}
                            </motion.h3>
                            <p className="flex-grow text-sm text-gray-600 sm:text-base">
                              {category.description}
                            </p>
                            <motion.div
                              className="mt-4"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <span className="inline-flex items-center font-medium text-primary-500 group-hover:text-primary-600">
                                {t('home.categories.viewKits', currentLocale)}{' '}
                                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>
        </AnimatedSection>

        {/* Testimonials Section */}
        <AnimatedSection>
          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                className="mb-12 text-center sm:mb-16"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <h2 className="mb-3 font-fredoka text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
                  {t('home.testimonials.title', currentLocale)}
                </h2>
                <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
                  {t('home.testimonials.description', currentLocale)}
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="transform rounded-2xl bg-gray-50 p-6 shadow-xl transition-all duration-200 sm:p-8"
                  >
                    <motion.div
                      className="mb-4 flex items-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      {[...Array(5 - testimonial.rating)].map((_, i) => (
                        <Star
                          key={`empty-${i}`}
                          className="h-5 w-5 fill-gray-300 text-gray-300"
                        />
                      ))}
                    </motion.div>
                    <motion.p
                      className="mb-5 text-sm leading-relaxed text-gray-700 sm:mb-6 sm:text-base"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                      viewport={{ once: true }}
                    >
                      «{testimonial.content}»
                    </motion.p>
                    <motion.div
                      className="flex items-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-lg font-semibold text-white sm:mr-4 sm:h-12 sm:w-12"
                        whileHover={{ scale: 1.05 }}
                      >
                        {testimonial.name.charAt(0)}
                      </motion.div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 sm:text-base">
                          {testimonial.name}
                        </h4>
                        <p className="text-xs text-gray-500 sm:text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </AnimatedSection>

        {/* Call to Action Section */}
        <AnimatedSection>
          <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 py-16 text-white sm:py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <motion.h2
                className="mb-6 font-fredoka text-3xl font-bold sm:text-4xl lg:text-5xl"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {t('home.cta.title', currentLocale)}
              </motion.h2>
              <motion.p
                className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-gray-200 sm:text-2xl"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {t('home.cta.description', currentLocale)}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/${currentLocale}/products`}
                    className="transform rounded-lg bg-white px-10 py-4 text-lg font-bold text-primary-600 shadow-xl transition-all duration-200 hover:bg-gray-100 hover:shadow-2xl sm:px-12 sm:text-xl"
                  >
                    {t('home.cta.button', currentLocale)}
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </AnimatedSection>
      </ClientOnly>
    </div>
  );
}
