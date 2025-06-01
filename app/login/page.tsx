'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { LogIn, User, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading('Выполняется вход...')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        // const data = await response.json() // Token is in HttpOnly cookie
        toast.success('Вход выполнен успешно!', { id: toastId })
        router.push('/admin') 
      } else {
        const errorData = await response.json().catch(() => ({})) // Catch if response is not json
        toast.error(errorData.error || 'Ошибка входа. Проверьте ваши учетные данные.', { id: toastId })
      }
    } catch (error) {
      console.error('Ошибка входа:', error)
      toast.error('Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl transform transition-all hover:scale-[1.01] duration-300">
        <div className="text-center">
          <Image 
            src="/logo/zereklab.jpg" // Corrected logo path
            alt="ZerekLab Logo"
            width={80} 
            height={80}
            className="mx-auto mb-5 rounded-full shadow-md"
          />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Вход в Панель
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Управление образовательными наборами ZerekLab
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Имя пользователя
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-shadow duration-150 ease-in-out shadow-sm hover:shadow-md"
                  placeholder="admin"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-shadow duration-150 ease-in-out shadow-sm hover:shadow-md"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                <LogIn className={`h-5 w-5 text-primary-300 group-hover:text-primary-200 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
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
  )
} 