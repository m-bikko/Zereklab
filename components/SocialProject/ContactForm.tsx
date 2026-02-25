'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { Loader2, Phone, User } from 'lucide-react';

interface ContactFormProps {
  locale: 'ru' | 'kk' | 'en';
}

export default function ContactForm({ locale }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formData.phone,
          subject: 'Заявка: Социальные проекты',
          message:
            'Пользователь оставил заявку на странице "Социальные проекты".',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      toast.success(
        locale === 'ru'
          ? 'Заявка отправлена!'
          : locale === 'kk'
            ? 'Өтінім жіберілді!'
            : 'Request sent!'
      );
      setFormData({ name: '', phone: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(
        locale === 'ru'
          ? 'Ошибка отправки'
          : locale === 'kk'
            ? 'Жіберу қатесі'
            : 'Send error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-8 font-fredoka text-3xl font-bold text-gray-900">
          {locale === 'ru'
            ? 'Есть идеи для проектов?'
            : locale === 'kk'
              ? 'Жобаларға идеяларыңыз бар ма?'
              : 'Have project ideas?'}
        </h2>
        <p className="mb-8 text-lg text-gray-600">
          {locale === 'ru'
            ? 'Оставьте свои контакты, и мы свяжемся с вами для обсуждения сотрудничества.'
            : locale === 'kk'
              ? 'Байланыс деректеріңізді қалдырыңыз, біз ынтымақтастықты талқылау үшін сізбен хабарласамыз.'
              : 'Leave your contacts, and we will contact you to discuss cooperation.'}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  required
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 transition-colors focus:border-primary-500 focus:ring-primary-500"
                  placeholder={
                    locale === 'ru'
                      ? 'Ваше имя'
                      : locale === 'kk'
                        ? 'Сіздің атыңыз'
                        : 'Your name'
                  }
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="sr-only">
                Phone
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 transition-colors focus:border-primary-500 focus:ring-primary-500"
                  placeholder={
                    locale === 'ru'
                      ? 'Ваш телефон (WhatsApp)'
                      : locale === 'kk'
                        ? 'Телефон нөміріңіз'
                        : 'Your phone'
                  }
                  value={formData.phone}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg border border-transparent bg-primary-600 px-4 py-3 text-lg font-medium text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="-ml-1 mr-2 h-5 w-5 animate-spin" />
                  {locale === 'ru'
                    ? 'Отправка...'
                    : locale === 'kk'
                      ? 'Жіберілуде...'
                      : 'Sending...'}
                </>
              ) : locale === 'ru' ? (
                'Связаться с нами'
              ) : locale === 'kk' ? (
                'Бізбен байланысу'
              ) : (
                'Contact Us'
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
