'use client';

import { cleanPhoneInput, isValidPhoneNumber } from '@/lib/phoneUtils';

import { useState } from 'react';

import { Gift, Loader2, Phone, Search } from 'lucide-react';

interface PendingBonus {
  _id: string;
  bonusAmount: number;
  availableDate: string;
  saleId: string;
}

interface BonusData {
  phoneNumber: string;
  fullName?: string;
  availableBonuses: number;
  totalBonuses: number;
  usedBonuses: number;
  lastUpdated: string;
  pendingBonuses?: {
    available: PendingBonus[];
    upcoming: PendingBonus[];
    totalAvailable: number;
    totalUpcoming: number;
  };
}

export default function BonusLookup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [searchType, setSearchType] = useState<'phone' | 'name'>('phone');
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
    if (searchType === 'phone' && !isValidPhoneNumber(phoneNumber)) {
      setError('Введите корректный номер телефона');
      return;
    }

    if (searchType === 'name' && !fullName.trim()) {
      setError('Введите ФИО для поиска');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Build query parameters
      const params = new URLSearchParams();
      if (searchType === 'phone') {
        params.append('phone', phoneNumber);
      } else {
        params.append('name', fullName.trim());
      }

      // Fetch both current bonuses and pending bonuses
      const [bonusResponse, pendingResponse] = await Promise.all([
        fetch(`/api/bonuses?${params.toString()}`),
        fetch(`/api/pending-bonuses?${params.toString()}`),
      ]);

      if (bonusResponse.ok) {
        const bonusData = await bonusResponse.json();
        const combinedData = bonusData;

        // Add pending bonus data if available
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          combinedData.pendingBonuses = pendingData.pendingBonuses;
        }

        setBonusData(combinedData);
      } else {
        const errorData = await bonusResponse.json();
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
        <h3 className="text-xl font-semibold text-gray-900">
          Проверить бонусы
        </h3>
        <p className="text-gray-600">
          Введите номер телефона или ФИО для проверки накопленных бонусов
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Type Toggle */}
        <div className="flex rounded-lg border border-gray-300">
          <button
            type="button"
            onClick={() => setSearchType('phone')}
            className={`flex-1 rounded-l-lg px-4 py-2 text-sm font-medium ${
              searchType === 'phone'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            По номеру телефона
          </button>
          <button
            type="button"
            onClick={() => setSearchType('name')}
            className={`flex-1 rounded-r-lg px-4 py-2 text-sm font-medium ${
              searchType === 'name'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            По ФИО
          </button>
        </div>

        {searchType === 'phone' ? (
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Номер телефона
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={e => handlePhoneChange(e.target.value)}
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
        ) : (
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              ФИО клиента
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Иванов Иван Иванович"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            (searchType === 'phone' && !isValidPhoneNumber(phoneNumber)) ||
            (searchType === 'name' && !fullName.trim())
          }
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
              <p className="mb-1 text-sm text-gray-600">Доступные бонусы</p>
              <p className="text-3xl font-bold text-green-600">
                {bonusData.availableBonuses}
              </p>
              <p className="text-sm text-gray-500">бонусов</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="mb-1 text-xs text-gray-600">Всего накоплено</p>
              <p className="text-lg font-semibold text-blue-600">
                {bonusData.totalBonuses}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <p className="mb-1 text-xs text-gray-600">Потрачено</p>
              <p className="text-lg font-semibold text-purple-600">
                {bonusData.usedBonuses}
              </p>
            </div>
          </div>

          {/* Pending Bonuses Section */}
          {bonusData.pendingBonuses && (
            <div className="space-y-3">
              {/* Ready to credit bonuses */}
              {bonusData.pendingBonuses.available.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="mb-3 text-center">
                    <p className="text-sm font-medium text-yellow-800">
                      Готовы к начислению
                    </p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {bonusData.pendingBonuses.totalAvailable}
                    </p>
                    <p className="text-xs text-yellow-600">бонусов</p>
                  </div>
                  <div className="space-y-2">
                    {bonusData.pendingBonuses.available.map(bonus => (
                      <div
                        key={bonus._id}
                        className="flex justify-between text-xs text-yellow-700"
                      >
                        <span>
                          Покупка от{' '}
                          {new Date(bonus.availableDate).toLocaleDateString(
                            'ru-RU'
                          )}
                        </span>
                        <span>{bonus.bonusAmount} бонусов</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming bonuses */}
              {bonusData.pendingBonuses.upcoming.length > 0 && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="mb-3 text-center">
                    <p className="text-sm font-medium text-orange-800">
                      Ожидают начисления
                    </p>
                    <p className="text-2xl font-bold text-orange-700">
                      {bonusData.pendingBonuses.totalUpcoming}
                    </p>
                    <p className="text-xs text-orange-600">бонусов</p>
                  </div>
                  <div className="space-y-2">
                    {bonusData.pendingBonuses.upcoming.map(bonus => (
                      <div
                        key={bonus._id}
                        className="flex justify-between text-xs text-orange-700"
                      >
                        <span>
                          Будут доступны{' '}
                          {new Date(bonus.availableDate).toLocaleDateString(
                            'ru-RU'
                          )}
                        </span>
                        <span>{bonus.bonusAmount} бонусов</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 text-center">
            {bonusData.fullName && (
              <div className="text-sm font-medium text-gray-700">
                {bonusData.fullName}
              </div>
            )}
            {bonusData.phoneNumber && (
              <div className="text-sm text-gray-600">
                {bonusData.phoneNumber}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Последнее обновление:{' '}
              {new Date(bonusData.lastUpdated).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h4 className="mb-2 text-sm font-medium text-gray-900">
          Как работают бонусы?
        </h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• За каждую покупку начисляется 3% бонусов</li>
          <li>• Бонусы поступают через 10 дней после покупки</li>
          <li>• Бонусы можно использовать для оплаты следующих покупок</li>
          <li>• 1 бонус = 1 тенге</li>
        </ul>
      </div>
    </div>
  );
}
