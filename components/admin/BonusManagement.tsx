'use client';

import { formatNumber } from '@/lib/formatNumber';
import { cleanPhoneInput, isValidPhoneNumber } from '@/lib/phoneUtils';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  Calendar,
  Gift,
  Loader2,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

interface BonusData {
  _id: string;
  phoneNumber: string;
  fullName?: string;
  totalBonuses: number;
  usedBonuses: number;
  availableBonuses: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export default function BonusManagement() {
  const [bonuses, setBonuses] = useState<BonusData[]>([]);
  const [filteredBonuses, setFilteredBonuses] = useState<BonusData[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchName] = useState('');
  const [searchType] = useState<'phone' | 'name'>('phone');
  const [selectedBonus, setSelectedBonus] = useState<BonusData | null>(null);
  const [operationType, setOperationType] = useState<'add' | 'deduct' | null>(
    null
  );
  const [operationAmount, setOperationAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingBonuses, setFetchingBonuses] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  // const [newFullName] = useState('');

  useEffect(() => {
    fetchAllBonuses();
  }, []);

  useEffect(() => {
    let filtered = bonuses;

    if (searchType === 'phone' && searchPhone.trim()) {
      filtered = bonuses.filter(bonus =>
        bonus.phoneNumber.toLowerCase().includes(searchPhone.toLowerCase())
      );
    } else if (searchType === 'name' && searchName.trim()) {
      filtered = bonuses.filter(bonus =>
        bonus.fullName?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    setFilteredBonuses(filtered);
  }, [bonuses, searchPhone, searchName, searchType]);

  const fetchAllBonuses = async () => {
    setFetchingBonuses(true);
    try {
      const response = await fetch('/api/bonuses/all');
      if (response.ok) {
        const data = await response.json();
        setBonuses(data);
      } else {
        toast.error('Ошибка загрузки бонусов');
      }
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      toast.error('Ошибка загрузки бонусов');
    } finally {
      setFetchingBonuses(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchPhone(value);
  };

  const handleAddNewCustomer = () => {
    setNewPhoneNumber('');
    setShowAddModal(true);
  };

  const handleCreateNewCustomer = async () => {
    if (!isValidPhoneNumber(newPhoneNumber)) {
      toast.error('Введите корректный номер телефона');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/bonuses?phone=${encodeURIComponent(newPhoneNumber)}`
      );
      if (response.ok) {
        const data = await response.json();
        setBonuses(prev => [...prev, data]);
        setShowAddModal(false);
        toast.success('Клиент добавлен в систему бонусов');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка создания клиента');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Ошибка создания клиента');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBonusOperation = async () => {
    if (!selectedBonus || !operationType || operationAmount <= 0) {
      toast.error('Заполните все поля');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (operationType === 'add') {
        response = await fetch('/api/bonuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: selectedBonus.phoneNumber,
            bonusesToAdd: operationAmount,
          }),
        });
      } else {
        response = await fetch('/api/bonuses/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: selectedBonus.phoneNumber,
            bonusesToDeduct: operationAmount,
          }),
        });
      }

      if (response.ok) {
        const updatedBonus = await response.json();
        setBonuses(prev =>
          prev.map(bonus =>
            bonus._id === selectedBonus._id
              ? { ...bonus, ...updatedBonus }
              : bonus
          )
        );
        setSelectedBonus(null);
        setOperationType(null);
        setOperationAmount(0);
        toast.success(
          operationType === 'add'
            ? `Добавлено ${operationAmount} бонусов`
            : `Списано ${operationAmount} бонусов`
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка операции');
      }
    } catch (error) {
      console.error('Error in bonus operation:', error);
      toast.error('Ошибка операции');
    } finally {
      setSubmitting(false);
    }
  };

  const startOperation = (bonus: BonusData, type: 'add' | 'deduct') => {
    setSelectedBonus(bonus);
    setOperationType(type);
    setOperationAmount(0);
  };

  const cancelOperation = () => {
    setSelectedBonus(null);
    setOperationType(null);
    setOperationAmount(0);
  };

  // Statistics
  const totalCustomers = bonuses.length;
  const totalBonusesIssued = bonuses.reduce(
    (sum, bonus) => sum + bonus.totalBonuses,
    0
  );
  const totalBonusesUsed = bonuses.reduce(
    (sum, bonus) => sum + bonus.usedBonuses,
    0
  );
  const totalAvailableBonuses = bonuses.reduce(
    (sum, bonus) => sum + bonus.availableBonuses,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление бонусами
          </h2>
          <p className="text-gray-600">
            Просмотр и управление бонусной системой клиентов
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddNewCustomer}
            className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить клиента</span>
          </button>
          <button
            onClick={fetchAllBonuses}
            className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Обновить</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">
                Всего клиентов
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">
                Выдано бонусов
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(totalBonusesIssued)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">
                Потрачено бонусов
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(totalBonusesUsed)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">
                Доступно бонусов
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(totalAvailableBonuses)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по номеру телефона..."
            value={searchPhone}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bonuses Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b p-6">
          <h3 className="text-lg font-medium text-gray-900">Список клиентов</h3>
        </div>
        <div className="overflow-x-auto">
          {fetchingBonuses ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Загрузка...</span>
            </div>
          ) : filteredBonuses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Gift className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium">Клиенты не найдены</h3>
              <p>Начните добавлять клиентов в бонусную систему</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Телефон
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ФИО
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Всего накоплено
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Потрачено
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Доступно
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Последнее обновление
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredBonuses.map(bonus => (
                  <tr key={bonus._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {bonus.phoneNumber}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {bonus.fullName || 'Не указано'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatNumber(bonus.totalBonuses)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatNumber(bonus.usedBonuses)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        {formatNumber(bonus.availableBonuses)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(bonus.lastUpdated).toLocaleDateString(
                          'ru-RU'
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => startOperation(bonus, 'add')}
                          className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Начислить
                        </button>
                        <button
                          onClick={() => startOperation(bonus, 'deduct')}
                          className="inline-flex items-center rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                          disabled={bonus.availableBonuses === 0}
                        >
                          <Minus className="mr-1 h-3 w-3" />
                          Списать
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">
              Добавить нового клиента
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={newPhoneNumber}
                  onChange={e =>
                    setNewPhoneNumber(cleanPhoneInput(e.target.value))
                  }
                  placeholder="+7 (777) 123-12-12"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                {newPhoneNumber && !isValidPhoneNumber(newPhoneNumber) && (
                  <p className="mt-1 text-sm text-red-600">
                    Введите номер в формате +7 (777) 123-12-12
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateNewCustomer}
                  disabled={submitting || !isValidPhoneNumber(newPhoneNumber)}
                  className="flex items-center space-x-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Добавление...</span>
                    </>
                  ) : (
                    <span>Добавить</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operation Modal */}
      {selectedBonus && operationType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">
              {operationType === 'add' ? 'Начислить бонусы' : 'Списать бонусы'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Клиент
                </label>
                <p className="text-gray-900">{selectedBonus.phoneNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Доступно бонусов: {selectedBonus.availableBonuses}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Количество бонусов
                </label>
                <input
                  type="number"
                  min="1"
                  max={
                    operationType === 'deduct'
                      ? selectedBonus.availableBonuses
                      : undefined
                  }
                  value={operationAmount}
                  onChange={e => setOperationAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelOperation}
                  className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleBonusOperation}
                  disabled={submitting || operationAmount <= 0}
                  className="flex items-center space-x-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Обработка...</span>
                    </>
                  ) : (
                    <span>
                      {operationType === 'add' ? 'Начислить' : 'Списать'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
