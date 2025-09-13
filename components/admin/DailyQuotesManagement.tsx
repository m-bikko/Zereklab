'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  Quote,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
} from 'lucide-react';

interface DailyQuote {
  id: string;
  text: string;
  author: string;
  dateAdded: string;
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

  const loadDailyQuotes = () => {
    try {
      const storedQuotes = localStorage.getItem('zereklab_daily_quotes');
      if (storedQuotes) {
        const quotes = JSON.parse(storedQuotes);
        setDailyQuotes(quotes);
      }
    } catch (error) {
      console.error('Error loading daily quotes:', error);
    }
  };

  const saveDailyQuotes = (quotes: DailyQuote[]) => {
    try {
      localStorage.setItem('zereklab_daily_quotes', JSON.stringify(quotes));
      setDailyQuotes(quotes);
    } catch (error) {
      console.error('Error saving daily quotes:', error);
      toast.error('Ошибка при сохранении цитат');
    }
  };

  // Добавление новой цитаты
  const handleAddQuote = () => {
    if (!newQuote.text.trim() || !newQuote.author.trim()) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    const quote: DailyQuote = {
      id: Date.now().toString(),
      text: newQuote.text.trim(),
      author: newQuote.author.trim(),
      dateAdded: new Date().toISOString(),
    };

    const updatedQuotes = [...dailyQuotes, quote];
    saveDailyQuotes(updatedQuotes);
    
    setNewQuote({ text: '', author: '' });
    setIsAddingQuote(false);
    toast.success('Цитата добавлена');
  };

  // Удаление цитаты
  const handleDeleteQuote = (quoteId: string) => {
    const updatedQuotes = dailyQuotes.filter(quote => quote.id !== quoteId);
    saveDailyQuotes(updatedQuotes);
    toast.success('Цитата удалена');
  };

  // Начало редактирования
  const startEditing = (quote: DailyQuote) => {
    setEditingQuote(quote.id);
    setNewQuote({ text: quote.text, author: quote.author });
  };

  // Сохранение изменений
  const saveEdit = (quoteId: string) => {
    if (!newQuote.text.trim() || !newQuote.author.trim()) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    const updatedQuotes = dailyQuotes.map(quote =>
      quote.id === quoteId
        ? { ...quote, text: newQuote.text.trim(), author: newQuote.author.trim() }
        : quote
    );
    
    saveDailyQuotes(updatedQuotes);
    setEditingQuote(null);
    setNewQuote({ text: '', author: '' });
    toast.success('Цитата обновлена');
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingQuote(null);
    setNewQuote({ text: '', author: '' });
  };

  // Вычисление текущей цитаты дня
  const getCurrentDayQuote = (): DailyQuote | null => {
    if (dailyQuotes.length === 0) return null;

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % dailyQuotes.length;
    return dailyQuotes[quoteIndex];
  };

  const currentDayQuote = getCurrentDayQuote();

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
          <Calendar className="mr-2 h-5 w-5" />
          Как работает система
        </h3>
        <div className="text-sm text-blue-800">
          <ul className="list-disc space-y-1 pl-5">
            <li>Цитаты автоматически меняются каждый день</li>
            <li>Основаны на дне года (1-365/366)</li>
            <li>Цикл повторяется: день % количество_цитат</li>
            <li>Цитаты вводятся только на одном языке</li>
            <li>На лендинге отображается как "Цитата дня"</li>
          </ul>
        </div>
      </div>

      {/* Текущая цитата дня */}
      {currentDayQuote && (
        <div className="rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <Quote className="mr-2 h-5 w-5 text-primary-600" />
            Цитата сегодня
          </h3>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <blockquote className="mb-3 text-lg font-medium text-gray-900">
              "{currentDayQuote.text}"
            </blockquote>
            <cite className="text-sm font-medium text-gray-600">
              - {currentDayQuote.author}
            </cite>
          </div>
        </div>
      )}

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
                key={quote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                {editingQuote === quote.id ? (
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
                        onClick={() => saveEdit(quote.id)}
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
                        "{quote.text}"
                      </blockquote>
                      <cite className="text-sm text-gray-600">
                        - {quote.author}
                      </cite>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>День {(index % dailyQuotes.length) + 1} в цикле</span>
                        <span>
                          Добавлено: {new Date(quote.dateAdded).toLocaleDateString('ru-RU')}
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
                        onClick={() => handleDeleteQuote(quote.id)}
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