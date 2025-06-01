import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Star, Users, Award, Lightbulb, Rocket, BookOpen, Brain, Wrench, GraduationCap } from 'lucide-react'

export default function HomePage() {
  const benefits = [
    {
      icon: Lightbulb,
      title: 'Разжигайте Креативность',
      description: 'Пробудите воображение вашего ребенка с помощью практического обучения, воплощающего идеи в жизнь.'
    },
    {
      icon: Rocket,
      title: 'Готовность к Будущему',
      description: 'Подготовьте детей к завтрашнему миру с помощью передовых технологий и STEM-образования.'
    },
    {
      icon: BookOpen,
      title: 'Учитесь Делая',
      description: 'Интерактивные наборы, которые делают сложные концепции простыми и увлекательными для понимания.'
    },
    {
      icon: GraduationCap,
      title: 'Экспертная Поддержка',
      description: 'Подробные руководства и поддержка для обеспечения успешных результатов обучения.'
    }
  ]

  const testimonials = [
    {
      name: 'Айгерим С.',
      role: 'Родитель',
      content: 'Моя дочь в восторге от набора по робототехнике! Она так много узнала о программировании и инженерии.',
      rating: 5
    },
    {
      name: 'Михаил И.',
      role: 'Педагог',
      content: 'Эти наборы кардинально изменили мой подход к преподаванию STEM. Ученики увлечены как никогда!',
      rating: 5
    },
    {
      name: 'Елена П.',
      role: 'Родитель',
      content: 'Идеальный баланс веселья и обучения. Сын создал удивительные проекты с этими наборами.',
      rating: 5
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Счастливых Детей' },
    { number: '500+', label: 'Школ Используют' },
    { number: '50+', label: 'Образовательных Наборов' },
    { number: '99%', label: 'Уровень Удовлетворенности' }
  ]

  const featuredCategories = [
    {
      title: 'Электроника',
      description: 'Изучайте схемы, датчики и электронные компоненты',
      image: '/images/electronics-category.jpg',
      href: '/products?category=Электроника',
      icon: Wrench
    },
    {
      title: 'Робототехника',
      description: 'Создавайте и программируйте собственных роботов',
      image: '/images/robotics-category.jpg',
      href: '/products?category=Робототехника',
      icon: Rocket
    },
    {
      title: 'Программирование',
      description: 'Программируйте свой путь к удивительным проектам',
      image: '/images/programming-category.jpg',
      href: '/products?category=Программирование',
      icon: Brain
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Вдохновляем Новое
                <span className="text-primary-400 block">Поколение</span>
                Инноваторов
              </h1>
              <p className="text-xl sm:text-2xl text-gray-200 mb-8 leading-relaxed">
                Образовательные наборы, которые делают обучение веселым, интерактивным и значимым. 
                Идеально для детей, которые любят строить, создавать и исследовать.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center group text-lg shadow-md hover:shadow-lg"
                >
                  Все наборы
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-white text-white hover:bg-white hover:text-secondary-700 font-semibold py-3.5 px-8 rounded-full transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                  Узнать больше
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute -inset-4 bg-primary-500/20 rounded-full blur-xl animate-pulse-slow"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Rocket className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">Строй и Учись</h3>
                        <p className="text-gray-300">Практическое STEM-образование</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Lightbulb className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">Разжигай Креативность</h3>
                        <p className="text-gray-300">Безграничные возможности</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Award className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">Признание Экспертов</h3>
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
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-xl shadow-lg hover:shadow-primary-500/10 transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl sm:text-4xl font-bold text-primary-500 mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Почему ZerekLab?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Мы стремимся предоставить лучший образовательный опыт для юных умов с помощью инновационных наборов.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 transform hover:scale-105">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-md group-hover:shadow-lg">
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Наши Категории
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              От электроники до робототехники — найдите идеальный набор для каждого юного инноватора.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCategories.map((category, index) => {
              const CategoryIcon = category.icon;
              return (
              <Link key={index} href={category.href} className="group block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col group-hover:shadow-2xl group-hover:shadow-primary-500/20 transition-all duration-300 transform group-hover:scale-105">
                  <div className="relative h-48 sm:h-56 w-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center overflow-hidden">
                     {/* <Image src={category.image} alt={category.title} layout="fill" objectFit="cover" className="opacity-30 group-hover:opacity-50 transition-opacity"/> */}
                     <CategoryIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base flex-grow">{category.description}</p>
                    <div className="mt-4">
                      <span className="inline-flex items-center text-primary-500 font-medium group-hover:text-primary-600">
                        Смотреть наборы <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Отзывы Родителей и Педагогов
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Присоединяйтесь к тысячам семей, которые доверяют ZerekLab качественный образовательный опыт.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-gray-300" />
                  ))}
                </div>
                <p className="text-gray-700 mb-5 sm:mb-6 leading-relaxed text-sm sm:text-base">«{testimonial.content}»</p>
                <div className="flex items-center">
                  {/* Placeholder for avatar image */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-lg mr-3 sm:mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
                    <p className="text-gray-500 text-xs sm:text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Готовы Начать Приключение в Мир STEM?
          </h2>
          <p className="text-xl sm:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Выберите идеальный набор для вашего ребенка и откройте дверь в мир увлекательного обучения и бесконечных возможностей.
          </p>
          <Link
            href="/products"
            className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-10 sm:px-12 rounded-full transition-all duration-300 transform hover:scale-105 text-lg sm:text-xl shadow-2xl hover:shadow-xl"
          >
            Выбрать Набор
          </Link>
        </div>
      </section>
    </div>
  )
} 