'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  BarChart3,
  Calendar,
  QrCode,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

interface QRAnalyticsData {
  totalCount: number;
  periodCount: number;
  dailyCounts: Array<{
    date: string;
    count: number;
  }>;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export default function QRAnalytics() {
  const [data, setData] = useState<QRAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/qr-analytics?days=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching QR analytics:', error);
      toast.error('Ошибка загрузки аналитики QR кодов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxCount = data ? Math.max(...data.dailyCounts.map(d => d.count)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">QR Аналитика</h2>
          <p className="text-gray-600">Статистика переходов по QR кодам</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={e => setPeriod(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={7}>Последние 7 дней</option>
            <option value={30}>Последние 30 дней</option>
            <option value={90}>Последние 90 дней</option>
          </select>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Загрузка аналитики...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Всего переходов
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {data?.totalCount || 0}
                  </p>
                </div>
                <QrCode className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    За {period} дней
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {data?.periodCount || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="rounded-lg bg-purple-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Среднее в день
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {data?.periodCount && period
                      ? Math.round((data.periodCount / period) * 10) / 10
                      : 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Переходы по дням
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <BarChart3 className="h-4 w-4" />
                <span>Максимум: {maxCount}</span>
              </div>
            </div>

            <div className="space-y-2">
              {data?.dailyCounts.map((item, index) => {
                const percentage =
                  maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                const date = new Date(item.date);
                const dayName = date.toLocaleDateString('ru-RU', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });

                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-20 text-xs text-gray-500">{dayName}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="relative h-6 flex-1 rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-8 text-right text-sm font-medium text-gray-700">
                          {item.count}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(!data?.dailyCounts || data.dailyCounts.length === 0) && (
              <div className="py-12 text-center text-gray-500">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>Нет данных за выбранный период</p>
              </div>
            )}
          </div>

          {/* QR Code Info */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Информация о QR кодах
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="font-medium text-gray-900">teqhk</p>
                  <p className="text-sm text-gray-500">
                    https://www.zereklab.com/ru/qr/teqhk → Главная страница
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.totalCount || 0}
                  </p>
                  <p className="text-sm text-gray-500">переходов</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
