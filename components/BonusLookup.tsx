'use client';

import { cleanPhoneInput, isValidPhoneNumber } from '@/lib/phoneUtils';

import { useState } from 'react';

import { Gift, Search, Loader2, Phone } from 'lucide-react';

interface BonusData {
  phoneNumber: string;
  availableBonuses: number;
  totalBonuses: number;
  usedBonuses: number;
  lastUpdated: string;
}

export default function BonusLookup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bonusData, setBonusData] = useState<BonusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (value: string) => {
    const cleaned = cleanPhoneInput(value);
    setPhoneNumber(cleaned);
    
    // Clear previous results when phone changes
    if (bonusData) {
      setBonusData(null);
    }
    if (error) {
      setError('');
    }
  };

  const searchBonuses = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Введите корректный номер телефона');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/bonuses?phone=${encodeURIComponent(phoneNumber)}`);
      
      if (response.ok) {
        const data = await response.json();
        setBonusData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка при поиске бонусов');
      }
    } catch (err) {
      console.error('Error fetching bonuses:', err);
      setError('Ошибка при поиске бонусов');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchBonuses();
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-orange-500">
          <Gift className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Проверить бонусы</h3>
        <p className="text-gray-600">Введите номер телефона для проверки накопленных бонусов</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
            Номер телефона
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+7 (777) 123-12-12"
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
            <p className="mt-1 text-sm text-red-600">
              Введите номер в формате +7 (777) 123-12-12
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isValidPhoneNumber(phoneNumber)}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-primary-500 to-orange-500 px-4 py-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Поиск...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Проверить бонусы</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {bonusData && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Доступные бонусы</p>
              <p className="text-3xl font-bold text-green-600">
                {bonusData.availableBonuses}
              </p>
              <p className="text-sm text-gray-500">бонусов</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Всего накоплено</p>
              <p className="text-lg font-semibold text-blue-600">
                {bonusData.totalBonuses}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Потрачено</p>
              <p className="text-lg font-semibold text-purple-600">
                {bonusData.usedBonuses}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Последнее обновление: {new Date(bonusData.lastUpdated).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h4 className="mb-2 text-sm font-medium text-gray-900">Как работают бонусы?</h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• За каждую покупку начисляется 5% бонусов</li>
          <li>• Бонусы можно использовать для оплаты следующих покупок</li>
          <li>• 1 бонус = 1 тенге</li>
        </ul>
      </div>
    </div>
  );
}