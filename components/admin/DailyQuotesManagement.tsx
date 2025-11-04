'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Shuffle,
  Quote,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';

interface DailyQuote {
  _id: string;
  text: string;
  author: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DailyQuotesManagement() {
  const [dailyQuotes, setDailyQuotes] = useState<DailyQuote[]>([]);
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [editingQuote, setEditingQuote] = useState<string | null>(null);
  const [newQuote, setNewQuote] = useState({ text: '', author: '' });

  // Загрузка существующих цитат при инициализации
  useEffect(() => {
    loadDailyQuotes();
  }, []);

  const loadDailyQuotes = async () => {
    try {
      const response = await fetch('/api/quotes/all');
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      const result = await response.json();
      if (result.success) {
        setDailyQuotes(result.data);
      }
    } catch (error) {
      console.error('Error loading daily quotes:', error);
      toast.error('Ошибка при загрузке цитат');
    }
  };

  // Добавление новой цитаты
  const handleAddQuote = async () => {
    if (!newQuote.text.trim() || !newQuote.author.trim()) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newQuote.text.trim(),
          author: newQuote.author.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add quote');
      }

      const result = await response.json();
      if (result.success) {
        await loadDailyQuotes(); // Reload quotes
        setNewQuote({ text: '', author: '' });
        setIsAddingQuote(false);
        toast.success('Цитата добавлена');
      }
    } catch (error) {
      console.error('Error adding quote:', error);
      toast.error('Ошибка при добавлении цитаты');
    }
  };

  // Удаление цитаты
  const handleDeleteQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/quotes?id=${quoteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quote');
      }

      const result = await response.json();
      if (result.success) {
        await loadDailyQuotes(); // Reload quotes
        toast.success('Цитата удалена');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Ошибка при удалении цитаты');
    }
  };

  // Начало редактирования
  const startEditing = (quote: DailyQuote) => {
    setEditingQuote(quote._id);
    setNewQuote({ text: quote.text, author: quote.author });
  };

  // Сохранение изменений
  const saveEdit = async (quoteId: string) => {
    if (!newQuote.text.trim() || !newQuote.author.trim()) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const response = await fetch('/api/quotes/all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: quoteId,
          text: newQuote.text.trim(),
          author: newQuote.author.trim(),
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quote');
      }

      const result = await response.json();
      if (result.success) {
        await loadDailyQuotes(); // Reload quotes
        setEditingQuote(null);
        setNewQuote({ text: '', author: '' });
        toast.success('Цитата обновлена');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Ошибка при обновлении цитаты');
    }
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingQuote(null);
    setNewQuote({ text: '', author: '' });
  };

  // Получение случайной цитаты для предварительного просмотра
  const [previewQuote, setPreviewQuote] = useState<DailyQuote | null>(null);

  const getRandomQuote = async () => {
    try {
      const response = await fetch('/api/quotes');
      const result = await response.json();
      if (result.success && result.data) {
        setPreviewQuote(result.data);
      }
    } catch (error) {
      console.error('Error getting random quote:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Управление ежедневными цитатами
        </h2>
        <div className="text-sm text-gray-500">
          Всего цитат: {dailyQuotes.length}
        </div>
      </div>

      {/* Информация о системе */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 flex items-center text-lg font-semibold text-blue-900">
          <Shuffle className="mr-2 h-5 w-5" />
          Как работает новая система
        </h3>
        <div className="text-sm text-blue-800">
          <ul className="list-disc space-y-1 pl-5">
            <li>Цитаты выбираются случайным образом при каждом обновлении страницы</li>
            <li>Цитаты хранятся в базе данных (больше не в localStorage)</li>
            <li>Всегда есть резервные цитаты, если база данных пуста</li>
            <li>Работает стабильно на всех устройствах, включая мобильные</li>
            <li>На главной странице показывается как &ldquo;Случайная цитата&rdquo;</li>
          </ul>
        </div>
      </div>

      {/* Предварительный просмотр случайной цитаты */}
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center text-lg font-semibold text-gray-900">
            <Quote className="mr-2 h-5 w-5 text-primary-600" />
            Предварительный просмотр
          </h3>
          <button
            onClick={getRandomQuote}
            className="inline-flex items-center rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Получить случайную
          </button>
        </div>
        {previewQuote ? (
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <blockquote className="mb-3 text-lg font-medium text-gray-900">
              &ldquo;{previewQuote.text}&rdquo;
            </blockquote>
            <cite className="text-sm font-medium text-gray-600">
              - {previewQuote.author}
            </cite>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-4 shadow-sm text-center text-gray-500">
            Нажмите кнопку выше, чтобы загрузить случайную цитату
          </div>
        )}
      </div>

      {/* Добавление новой цитаты */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Добавить новую цитату
          </h3>
          {!isAddingQuote && (
            <button
              onClick={() => setIsAddingQuote(true)}
              className="inline-flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить цитату
            </button>
          )}
        </div>

        {isAddingQuote && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Текст цитаты
              </label>
              <textarea
                value={newQuote.text}
                onChange={(e) => setNewQuote(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Введите текст цитаты..."
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Автор
              </label>
              <input
                type="text"
                value={newQuote.author}
                onChange={(e) => setNewQuote(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Введите имя автора..."
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAddQuote}
                className="inline-flex items-center rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </button>
              <button
                onClick={() => {
                  setIsAddingQuote(false);
                  setNewQuote({ text: '', author: '' });
                }}
                className="inline-flex items-center rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
              >
                <X className="mr-2 h-4 w-4" />
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Список цитат */}
      {dailyQuotes.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Все цитаты
          </h3>
          <div className="space-y-3">
            {dailyQuotes.map((quote, index) => (
              <motion.div
                key={quote._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                {editingQuote === quote._id ? (
                  <div className="space-y-4">
                    <textarea
                      value={newQuote.text}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      rows={3}
                    />
                    <input
                      type="text"
                      value={newQuote.author}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveEdit(quote._id)}
                        className="inline-flex items-center rounded-lg bg-green-500 px-3 py-1 text-sm font-medium text-white hover:bg-green-600"
                      >
                        <Save className="mr-1 h-3 w-3" />
                        Сохранить
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center rounded-lg bg-gray-500 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <blockquote className="mb-2 text-base font-medium text-gray-900">
                        &ldquo;{quote.text}&rdquo;
                      </blockquote>
                      <cite className="text-sm text-gray-600">
                        - {quote.author}
                      </cite>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {quote._id.slice(-6)}</span>
                        <span>
                          Добавлено: {new Date(quote.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${quote.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {quote.isActive ? 'Активна' : 'Неактивна'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(quote)}
                        className="rounded-full bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuote(quote._id)}
                        className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-4 text-lg font-semibold text-yellow-800">
            Нет добавленных цитат
          </h3>
          <p className="mt-2 text-yellow-700">
            Добавьте цитаты для ежедневной ротации на главной странице
          </p>
        </div>
      )}
    </div>
  );
} 