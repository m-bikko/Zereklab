'use client';

import { useAuth } from '@/hooks/useAuth';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { KeyRound, LogIn, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Выполняется вход...');

    try {
      const success = await login(username, password);

      if (success) {
        toast.success('Вход выполнен успешно!', { id: toastId });
        router.push('/admin');
      } else {
        toast.error('Неверное имя пользователя или пароль', { id: toastId });
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      toast.error(
        'Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.',
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md transform space-y-8 rounded-xl bg-white p-8 shadow-2xl transition-all duration-300 hover:scale-[1.01] sm:p-10">
        <div className="text-center">
          <Image
            src="/logo/zereklab.jpg"
            alt="ZerekLab Logo"
            width={60}
            height={60}
            className="mx-auto mb-5 rounded-full shadow-md"
            style={{ width: '60px', height: '60px' }}
          />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Вход в Панель
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Управление образовательными наборами ZerekLab
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Имя пользователя
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 pl-10 text-gray-900 placeholder-gray-400 shadow-sm transition-shadow duration-150 ease-in-out hover:shadow-md focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Пароль
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 pl-10 text-gray-900 placeholder-gray-400 shadow-sm transition-shadow duration-150 ease-in-out hover:shadow-md focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm"
                  placeholder="Введите пароль"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full transform justify-center rounded-md border border-transparent bg-gradient-to-r from-primary-600 to-secondary-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:from-primary-700 hover:to-secondary-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <LogIn
                  className={`h-5 w-5 text-primary-300 group-hover:text-primary-200 ${loading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              </span>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ZerekLab. Все права защищены.
        </p>
      </div>
    </div>
  );
}
