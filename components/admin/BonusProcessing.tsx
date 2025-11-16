'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, RefreshCw, Play, Calendar, User, Users } from 'lucide-react';
import { formatNumber, formatBonus } from '@/lib/formatNumber';

interface BonusStats {
  totalPending: number;
  totalProcessed: number;
  readyForProcessing: number;
  totalPendingAmount: number;
  readyAmount: number;
}

interface PendingCustomer {
  _id: string;
  phoneNumber: string;
  fullName?: string;
  totalBonuses: number;
  totalPurchases: number;
  bonuses: {
    saleId: string;
    bonusAmount: number;
    availableDate: string;
    isReady: boolean;
  }[];
}

export default function BonusProcessing() {
  const [stats, setStats] = useState<BonusStats | null>(null);
  const [pendingCustomers, setPendingCustomers] = useState<PendingCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/process-bonuses');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setPendingCustomers(data.pendingCustomers || []);
      } else {
        toast.error('Ошибка загрузки статистики');
      }
    } catch (error) {
      console.error('Error fetching bonus stats:', error);
      toast.error('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  const processReadyBonuses = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/process-bonuses', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`Обработано ${result.processedCount} бонусов`);
        // Refresh stats after processing
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка обработки бонусов');
      }
    } catch (error) {
      console.error('Error processing bonuses:', error);
      toast.error('Ошибка обработки бонусов');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Обработка бонусов
          </h3>
          <p className="text-gray-600">
            Управление автоматическим начислением отложенных бонусов
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Ready for Processing */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-800">Готовы к начислению</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.readyForProcessing}</p>
                <p className="text-sm text-yellow-700">{formatBonus(stats.readyAmount)}</p>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-800">Ожидают</p>
                <p className="text-2xl font-bold text-orange-900">{stats.totalPending}</p>
                <p className="text-sm text-orange-700">{formatBonus(stats.totalPendingAmount)}</p>
              </div>
            </div>
          </div>

          {/* Processed */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-800">Обработано</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalProcessed}</p>
                <p className="text-sm text-green-700">всего начислений</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Button */}
      {stats && stats.readyForProcessing > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Обработать готовые бонусы</h4>
              <p className="text-sm text-gray-600">
                {stats.readyForProcessing} бонусных начислений готовы к обработке
              </p>
            </div>
            <button
              onClick={processReadyBonuses}
              disabled={processing}
              className="flex items-center space-x-2 rounded-lg bg-green-500 px-6 py-3 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Обработка...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Обработать сейчас</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Pending Customers List */}
      {pendingCustomers.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-gray-600" />
              <h4 className="font-medium text-gray-900">Люди в ожидании бонусов</h4>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {pendingCustomers.length} клиентов
              </span>
            </div>
            <button
              onClick={() => setShowCustomers(!showCustomers)}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span>{showCustomers ? 'Скрыть' : 'Показать'}</span>
            </button>
          </div>

          {showCustomers && (
            <div className="divide-y divide-gray-200">
              {pendingCustomers.map((customer) => {
                const readyBonuses = customer.bonuses.filter(b => b.isReady);
                const upcomingBonuses = customer.bonuses.filter(b => !b.isReady);
                
                return (
                  <div key={customer._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {customer.fullName || 'Имя не указано'}
                            </h5>
                            <p className="text-sm text-gray-600">{customer.phoneNumber}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Всего покупок</p>
                            <p className="font-medium text-gray-900">{customer.totalPurchases}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Всего бонусов</p>
                            <p className="font-medium text-gray-900">{formatNumber(customer.totalBonuses)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Готовы к начислению</p>
                            <p className="font-medium text-green-600">
                              {formatNumber(readyBonuses.reduce((sum, b) => sum + b.bonusAmount, 0))}
                            </p>
                          </div>
                        </div>

                        {/* Bonus Details */}
                        <div className="mt-4 space-y-2">
                          {readyBonuses.map((bonus, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                              <div className="flex items-center space-x-3">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium text-green-800">
                                  {bonus.bonusAmount} бонусов
                                </span>
                                <span className="text-xs text-green-600">
                                  Готово к начислению
                                </span>
                              </div>
                              <span className="text-xs text-green-600">
                                {new Date(bonus.availableDate).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          ))}
                          
                          {upcomingBonuses.map((bonus, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg bg-orange-50 p-3">
                              <div className="flex items-center space-x-3">
                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                <span className="text-sm font-medium text-orange-800">
                                  {bonus.bonusAmount} бонусов
                                </span>
                                <span className="text-xs text-orange-600">
                                  Ожидает
                                </span>
                              </div>
                              <span className="text-xs text-orange-600">
                                {new Date(bonus.availableDate).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-lg bg-blue-50 p-6">
        <h4 className="mb-3 font-medium text-blue-900">Как работает автоматическое начисление</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start space-x-2">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Бонусы начисляются через 10 дней после покупки</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Система автоматически проверяет готовые к начислению бонусы</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Можно обрабатывать бонусы вручную или настроить автоматический процесс</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Для автоматизации используйте cron job: <code className="rounded bg-blue-100 px-2 py-1 text-xs">node scripts/process-bonuses.js</code></span>
          </li>
        </ul>
      </div>
    </div>
  );
}