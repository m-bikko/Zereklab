'use client'

import Image from 'next/image'
import { Lightbulb, Users, Target, Heart, BookOpen, ShieldCheck, Puzzle } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            О ZerekLab
          </h1>
          <p className="text-xl sm:text-2xl opacity-90 max-w-2xl mx-auto">
            Вдохновляем следующее поколение инноваторов и создателей через практическое обучение.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 p-8 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Lightbulb className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Наша Миссия</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                В ZerekLab наша миссия — сделать STEM-образование доступным, увлекательным и веселым для детей во всем мире. Мы верим, что практический опыт — ключ к раскрытию потенциала ребенка и воспитанию любви к обучению и открытиям на всю жизнь.
              </p>
            </div>
            <div className="space-y-6 p-8 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary-100 rounded-full">
                  <Target className="w-8 h-8 text-secondary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Наше Видение</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Мы видим мир, где каждый ребенок имеет возможность исследовать свое любопытство, развивать критическое мышление и становиться уверенным решателем проблем. Наши образовательные наборы призваны стать искрой, зажигающей этот путь.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-100 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 sm:mb-16">Почему ZerekLab?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Heart}
              title="Страсть к Образованию"
              description="Нами движет глубокая страсть к образованию и стремление предоставлять высококачественные инструменты обучения."
            />
            <FeatureCard
              icon={Users}
              title="Дизайн, Ориентированный на Детей"
              description="Наши наборы тщательно разработаны, чтобы быть увлекательными, соответствовать возрасту и быть безопасными для юных учеников."
            />
            <FeatureCard
              icon={BookOpen}
              title="Инновационное Обучение"
              description="Мы постоянно внедряем инновации, чтобы воплощать новейшие концепции STEM в жизнь с помощью интерактивных и захватывающих проектов."
            />
             <FeatureCard
              icon={ShieldCheck}
              title="Качество и Безопасность"
              description="Все наши продукты проходят строгий контроль качества и изготовлены из безопасных, прочных материалов."
            />
             <FeatureCard
              icon={Puzzle} 
              title="Развитие Навыков"
              description="Наши наборы способствуют развитию критического мышления, решения проблем и творческих способностей."
            />
             <FeatureCard
              icon={Lightbulb} 
              title="Вдохновение на Будущее"
              description="Мы стремимся вдохновить детей на изучение науки и технологий, открывая перед ними новые горизонты."
            />
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">Наша История</h2>
          <div className="prose prose-lg text-gray-600 mx-auto leading-relaxed">
            <p>
              ZerekLab была основана группой энтузиастов – педагогов и инженеров, которые осознали потребность в лучших инструментах для обучения детей основам STEM. Разочарованные отсутствием увлекательных и доступных вариантов, мы решили создать свои собственные. То, что начиналось как небольшой проект, выросло в компанию, посвященную расширению возможностей юных умов.
            </p>
            <p>
              Наш путь подпитывается радостью, которую мы видим у детей, когда они строят, экспериментируют и учатся с нашими наборами. Мы гордимся тем, что являемся частью их образовательного приключения и стремимся сделать обучение не только полезным, но и по-настоящему захватывающим.
            </p>
          </div>
        </div>
      </section>

      {/* Optional Team Section - You can uncomment and fill this later */}
      {/* 
      <section className="bg-gray-100 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 sm:mb-16">Наша Команда</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[ 
              { name: 'Имя Фамилия 1', role: 'Должность 1', image: '/images/team/member1.jpg', bio: 'Краткая биография...' },
              { name: 'Имя Фамилия 2', role: 'Должность 2', image: '/images/team/member2.jpg', bio: 'Краткая биография...' },
              { name: 'Имя Фамилия 3', role: 'Должность 3', image: '/images/team/member3.jpg', bio: 'Краткая биография...' },
              { name: 'Имя Фамилия 4', role: 'Должность 4', image: '/images/team/member4.jpg', bio: 'Краткая биография...' },
            ].map((member, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="relative w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden shadow-md">
                   <Image src={member.image || '/images/placeholder-avatar.svg'} alt={member.name} layout="fill" objectFit="cover" /> 
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-primary-600">{member.role}</p>
                <p className="text-gray-600 mt-2 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}
    </div>
  )
}

// Helper component for consistent feature card styling
const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 transform hover:scale-105">
    <div className="flex justify-center items-center mb-4">
      <div className="p-4 bg-primary-100 rounded-full">
        <Icon className="w-8 h-8 text-primary-600" />
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">{title}</h3>
    <p className="text-gray-600 text-center leading-relaxed">{description}</p>
  </div>
) 