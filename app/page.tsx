'use client';

import DailyImageRotation from '@/components/DailyImageRotation';

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

export default function HomePage() {
  const benefits = [
    {
      icon: Lightbulb,
      title: 'Разжигайте Креативность',
      description:
        'Пробудите воображение вашего ребенка с помощью практического обучения, воплощающего идеи в жизнь.',
    },
    {
      icon: Rocket,
      title: 'Готовность к Будущему',
      description:
        'Подготовьте детей к завтрашнему миру с помощью передовых технологий и STEM-образования.',
    },
    {
      icon: BookOpen,
      title: 'Учитесь Делая',
      description:
        'Интерактивные наборы, которые делают сложные концепции простыми и увлекательными для понимания.',
    },
    {
      icon: GraduationCap,
      title: 'Экспертная Поддержка',
      description:
        'Подробные руководства и поддержка для обеспечения успешных результатов обучения.',
    },
  ];

  const testimonials = [
    {
      name: 'Айгерим С.',
      role: 'Родитель',
      content:
        'Моя дочь в восторге от набора по робототехнике! Она так много узнала о программировании и инженерии.',
      rating: 5,
    },
    {
      name: 'Михаил И.',
      role: 'Педагог',
      content:
        'Эти наборы кардинально изменили мой подход к преподаванию STEM. Ученики увлечены как никогда!',
      rating: 5,
    },
    {
      name: 'Елена П.',
      role: 'Родитель',
      content:
        'Идеальный баланс веселья и обучения. Сын создал удивительные проекты с этими наборами.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Счастливых Детей' },
    { number: '500+', label: 'Школ Используют' },
    { number: '50+', label: 'Образовательных Наборов' },
    { number: '99%', label: 'Уровень Удовлетворенности' },
  ];

  const featuredCategories = [
    {
      title: 'Электроника',
      description: 'Изучайте схемы, датчики и электронные компоненты',
      image: '/images/electronics-category.jpg',
      href: '/products?category=Электроника',
      icon: Wrench,
    },
    {
      title: 'Робототехника',
      description: 'Создавайте и программируйте собственных роботов',
      image: '/images/robotics-category.jpg',
      href: '/products?category=Робототехника',
      icon: Rocket,
    },
    {
      title: 'Программирование',
      description: 'Программируйте свой путь к удивительным проектам',
      image: '/images/programming-category.jpg',
      href: '/products?category=Программирование',
      icon: Brain,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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
                className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              >
                Вдохновляем Новое
                <motion.span
                  className="block text-primary-400"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                >
                  Поколение
                </motion.span>
                Инноваторов
              </motion.h1>
              <motion.p
                className="mb-8 text-xl leading-relaxed text-gray-200 sm:text-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              >
                Образовательные наборы, которые делают обучение веселым,
                интерактивным и значимым. Идеально для детей, которые любят
                строить, создавать и исследовать.
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
                    href="/products"
                    className="group flex w-full items-center justify-center rounded-lg bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-600 hover:shadow-xl sm:w-auto"
                  >
                    Все наборы
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/about"
                    className="flex w-full items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white hover:text-secondary-700 sm:w-auto"
                  >
                    Узнать больше
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
                    className="mb-1 text-3xl font-bold text-primary-500 sm:mb-2 sm:text-4xl"
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
              <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
                Почему ZerekLab?
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
                Мы стремимся предоставить лучший образовательный опыт для юных
                умов с помощью инновационных наборов.
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
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 sm:mb-3">
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
              <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
                Наши Категории
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
                От электроники до робототехники — найдите идеальный набор для
                каждого юного инноватора.
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
                          <motion.h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-primary-600 sm:text-2xl">
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
                              Смотреть наборы{' '}
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
              <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
                Отзывы Родителей и Педагогов
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
                Присоединяйтесь к тысячам семей, которые доверяют ZerekLab
                качественный образовательный опыт.
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
              className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              Готовы Начать Приключение в Мир STEM?
            </motion.h2>
            <motion.p
              className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-gray-200 sm:text-2xl"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Выберите идеальный набор для вашего ребенка и откройте дверь в мир
              увлекательного обучения и бесконечных возможностей.
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
                  href="/products"
                  className="transform rounded-lg bg-white px-10 py-4 text-lg font-bold text-primary-600 shadow-xl transition-all duration-200 hover:bg-gray-100 hover:shadow-2xl sm:px-12 sm:text-xl"
                >
                  Выбрать Набор
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
