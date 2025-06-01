import Image from 'next/image';
import Link from 'next/link';

import {
  Award,
  BookOpen,
  Brain,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Rocket,
  Star,
  Users,
  Wrench,
} from 'lucide-react';

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
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Вдохновляем Новое
                <span className="block text-primary-400">Поколение</span>
                Инноваторов
              </h1>
              <p className="mb-8 text-xl leading-relaxed text-gray-200 sm:text-2xl">
                Образовательные наборы, которые делают обучение веселым,
                интерактивным и значимым. Идеально для детей, которые любят
                строить, создавать и исследовать.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/products"
                  className="group flex transform items-center justify-center rounded-full bg-primary-500 px-8 py-3.5 text-lg font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary-600 hover:shadow-lg"
                >
                  Все наборы
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/about"
                  className="rounded-full border-2 border-white px-8 py-3.5 text-lg font-semibold text-white shadow-md transition-all duration-300 hover:bg-white hover:text-secondary-700 hover:shadow-lg"
                >
                  Узнать больше
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="animate-pulse-slow absolute -inset-4 rounded-full bg-primary-500/20 blur-xl"></div>
                <div className="relative rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md sm:p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg sm:h-16 sm:w-16">
                        <Rocket className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Строй и Учись
                        </h3>
                        <p className="text-gray-300">
                          Практическое STEM-образование
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-500 shadow-lg sm:h-16 sm:w-16">
                        <Lightbulb className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Разжигай Креативность
                        </h3>
                        <p className="text-gray-300">
                          Безграничные возможности
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg sm:h-16 sm:w-16">
                        <Award className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Признание Экспертов
                        </h3>
                        <p className="text-gray-300">Нам доверяют педагоги</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="transform rounded-xl bg-white p-6 text-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary-500/10"
              >
                <div className="mb-1 text-3xl font-bold text-primary-500 sm:mb-2 sm:text-4xl">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-600 sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
              Почему ZerekLab?
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
              Мы стремимся предоставить лучший образовательный опыт для юных
              умов с помощью инновационных наборов.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className="transform rounded-xl bg-gray-50 p-6 text-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10"
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md group-hover:shadow-lg sm:mb-6 sm:h-20 sm:w-20">
                    <IconComponent className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 sm:mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="bg-gradient-to-br from-gray-100 to-gray-200 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
              Наши Категории
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
              От электроники до робототехники — найдите идеальный набор для
              каждого юного инноватора.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredCategories.map((category, index) => {
              const CategoryIcon = category.icon;
              return (
                <Link key={index} href={category.href} className="group block">
                  <div className="flex h-full transform flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary-500/20">
                    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-500 sm:h-56">
                      {/* <Image src={category.image} alt={category.title} layout="fill" objectFit="cover" className="opacity-30 group-hover:opacity-50 transition-opacity"/> */}
                      <CategoryIcon className="h-16 w-16 text-white opacity-80 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100 sm:h-20 sm:w-20" />
                    </div>
                    <div className="flex flex-grow flex-col p-6">
                      <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-primary-600 sm:text-2xl">
                        {category.title}
                      </h3>
                      <p className="flex-grow text-sm text-gray-600 sm:text-base">
                        {category.description}
                      </p>
                      <div className="mt-4">
                        <span className="inline-flex items-center font-medium text-primary-500 group-hover:text-primary-600">
                          Смотреть наборы{' '}
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
              Отзывы Родителей и Педагогов
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
              Присоединяйтесь к тысячам семей, которые доверяют ZerekLab
              качественный образовательный опыт.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="transform rounded-2xl bg-gray-50 p-6 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/10 sm:p-8"
              >
                <div className="mb-4 flex items-center">
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
                </div>
                <p className="mb-5 text-sm leading-relaxed text-gray-700 sm:mb-6 sm:text-base">
                  «{testimonial.content}»
                </p>
                <div className="flex items-center">
                  {/* Placeholder for avatar image */}
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-lg font-semibold text-white sm:mr-4 sm:h-12 sm:w-12">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 sm:text-base">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-gray-500 sm:text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Готовы Начать Приключение в Мир STEM?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-gray-200 sm:text-2xl">
            Выберите идеальный набор для вашего ребенка и откройте дверь в мир
            увлекательного обучения и бесконечных возможностей.
          </p>
          <Link
            href="/products"
            className="transform rounded-full bg-white px-10 py-4 text-lg font-bold text-primary-600 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-xl sm:px-12 sm:text-xl"
          >
            Выбрать Набор
          </Link>
        </div>
      </section>
    </div>
  );
}
