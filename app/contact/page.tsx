'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error('Пожалуйста, заполните все обязательные поля.');
      return;
    }
    setIsSubmitting(true);
    toast.loading('Отправка сообщения...');

    // ЗАМЕНИТЬ: Интеграция с вашим API для отправки формы
    // Пример: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
    await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация задержки API

    toast.dismiss();
    console.log('Данные формы:', formData);
    toast.success(
      'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.'
    );
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-secondary-500 to-primary-500 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Свяжитесь с Нами
          </h1>
          <p className="mx-auto max-w-2xl text-xl opacity-90 sm:text-2xl">
            Мы будем рады услышать вас! Если у вас есть вопросы, отзывы или вы
            просто хотите поздороваться.
          </p>
        </div>
      </section>

      {/* Contact Info and Form Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* Contact Information */}
          <div className="space-y-8 rounded-xl bg-white p-8 shadow-xl transition-shadow hover:shadow-2xl">
            <h2 className="mb-8 text-3xl font-bold text-gray-800">
              Контактная Информация
            </h2>

            <ContactInfoItem
              icon={MapPin}
              title="Наш Адрес"
              lines={[
                'ул. Кабанбай Батыра, 60А/2',
                'Алматы, Казахстан, 050010',
              ]}
              actionText="Проложить маршрут"
              actionHref="https://go.2gis.com/abc123xyz" // Замените на реальную ссылку 2GIS/Google Maps
            />
            <ContactInfoItem
              icon={Mail}
              title="Электронная Почта"
              lines={[
                <>
                  Общие вопросы:{' '}
                  <a
                    href="mailto:info@zereklab.kz"
                    className="text-primary-600 transition-colors hover:text-primary-700"
                  >
                    info@zereklab.kz
                  </a>
                </>,
                <>
                  Поддержка:{' '}
                  <a
                    href="mailto:support@zereklab.kz"
                    className="text-primary-600 transition-colors hover:text-primary-700"
                  >
                    support@zereklab.kz
                  </a>
                </>,
              ]}
            />
            <ContactInfoItem
              icon={Phone}
              title="Телефон"
              lines={[
                <>
                  Основной:{' '}
                  <a
                    href="tel:+77271234567"
                    className="text-primary-600 transition-colors hover:text-primary-700"
                  >
                    +7 (727) 123-45-67
                  </a>
                </>,
                <>
                  WhatsApp:{' '}
                  <a
                    href="https://wa.me/77071234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 transition-colors hover:text-primary-700"
                  >
                    +7 (707) 123-45-67
                  </a>
                </>,
              ]}
            />
            <ContactInfoItem
              icon={Clock}
              title="Рабочие Часы"
              lines={[
                'Понедельник - Пятница: 9:00 - 18:00 (GMT+6)',
                'Суббота - Воскресенье: Выходной',
              ]}
            />
          </div>

          {/* Contact Form */}
          <div className="rounded-xl bg-white p-8 shadow-xl transition-shadow hover:shadow-2xl">
            <h2 className="mb-8 text-3xl font-bold text-gray-800">
              Отправьте Нам Сообщение
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Ваше Имя
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="Иван Петров"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Ваш Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="ivan@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Тема Сообщения
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="Вопрос о товаре X"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Сообщение
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="Здравствуйте, я хотел бы узнать больше о..."
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary-500 px-4 py-3 font-semibold text-white shadow-md transition-all duration-150 hover:bg-primary-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="h-5 w-5" />
                  <span>
                    {isSubmitting ? 'Отправка...' : 'Отправить Сообщение'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-gray-100 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 sm:text-4xl">
            Мы на Карте
          </h2>
          <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-xl bg-gray-200 shadow-xl">
            {/* ЗАМЕНИТЬ на реальный код встраивания карты от 2GIS или Google Maps */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.1234567890123!2d76.91801831548163!3d43.24101597913718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3883692f0b8b8e3d%3A0x8b1e2e7b7d7b5b8a!2sSatbayev%20University!5e0!3m2!1sru!2skz!4v1678886655123!5m2!1sru!2skz"
              width="100%"
              height="450" // Можно сделать адаптивным через aspect ratio или CSS
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Местоположение ZerekLab"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper component for consistent contact info item styling
const ContactInfoItem = ({
  icon: Icon,
  title,
  lines,
  actionText,
  actionHref,
}: {
  icon: React.ElementType;
  title: string;
  lines: (string | JSX.Element)[];
  actionText?: string;
  actionHref?: string;
}) => (
  <div className="flex items-start space-x-4">
    <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
      <Icon className="h-5 w-5 text-primary-600" />
    </div>
    <div>
      <h3 className="mb-1 text-xl font-semibold text-gray-700">{title}</h3>
      {lines.map((line, index) => (
        <p key={index} className="leading-relaxed text-gray-600">
          {line}
        </p>
      ))}
      {actionText && actionHref && (
        <a
          href={actionHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          {actionText} &rarr;
        </a>
      )}
    </div>
  </div>
);
