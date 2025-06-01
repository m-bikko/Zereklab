'use client';

import {
  BookOpen,
  Heart,
  Lightbulb,
  Puzzle,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            О ZerekLab
          </h1>
          <p className="mx-auto max-w-2xl text-xl opacity-90 sm:text-2xl">
            Вдохновляем следующее поколение инноваторов и создателей через
            практическое обучение.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6 rounded-xl bg-white p-8 shadow-xl transition-shadow hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary-100 p-3">
                  <Lightbulb className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Наша Миссия
                </h2>
              </div>
              <p className="text-lg leading-relaxed text-gray-600">
                В ZerekLab наша миссия — сделать STEM-образование доступным,
                увлекательным и веселым для детей во всем мире. Мы верим, что
                практический опыт — ключ к раскрытию потенциала ребенка и
                воспитанию любви к обучению и открытиям на всю жизнь.
              </p>
            </div>
            <div className="space-y-6 rounded-xl bg-white p-8 shadow-xl transition-shadow hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-secondary-100 p-3">
                  <Target className="h-8 w-8 text-secondary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Наше Видение
                </h2>
              </div>
              <p className="text-lg leading-relaxed text-gray-600">
                Мы видим мир, где каждый ребенок имеет возможность исследовать
                свое любопытство, развивать критическое мышление и становиться
                уверенным решателем проблем. Наши образовательные наборы
                призваны стать искрой, зажигающей этот путь.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-100 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 sm:mb-16 sm:text-4xl">
            Почему ZerekLab?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-800 sm:text-4xl">
            Наша История
          </h2>
          <div className="prose prose-lg mx-auto leading-relaxed text-gray-600">
            <p>
              ZerekLab была основана группой энтузиастов – педагогов и
              инженеров, которые осознали потребность в лучших инструментах для
              обучения детей основам STEM. Разочарованные отсутствием
              увлекательных и доступных вариантов, мы решили создать свои
              собственные. То, что начиналось как небольшой проект, выросло в
              компанию, посвященную расширению возможностей юных умов.
            </p>
            <p>
              Наш путь подпитывается радостью, которую мы видим у детей, когда
              они строят, экспериментируют и учатся с нашими наборами. Мы
              гордимся тем, что являемся частью их образовательного приключения
              и стремимся сделать обучение не только полезным, но и
              по-настоящему захватывающим.
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
  );
}

// Helper component for consistent feature card styling
const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10">
    <div className="mb-4 flex items-center justify-center">
      <div className="rounded-full bg-primary-100 p-4">
        <Icon className="h-8 w-8 text-primary-600" />
      </div>
    </div>
    <h3 className="mb-2 text-center text-xl font-semibold text-gray-800">
      {title}
    </h3>
    <p className="text-center leading-relaxed text-gray-600">{description}</p>
  </div>
);
