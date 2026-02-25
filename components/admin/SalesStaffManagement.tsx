'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  Edit,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Trash2,
  User,
  UserCheck,
  UserX,
} from 'lucide-react';

interface SalesStaffMember {
  _id: string;
  username: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface SalesStaffManagementProps {
  loading: boolean;
  onRefresh: () => void;
}

export default function SalesStaffManagement({
  loading,
}: SalesStaffManagementProps) {
  const [staff, setStaff] = useState<SalesStaffMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<SalesStaffMember | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    isActive: true,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/sales-staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      } else {
        toast.error('Ошибка загрузки сотрудников');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Ошибка загрузки сотрудников');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      isActive: true,
    });
    setEditingStaff(null);
    setShowPassword(false);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (staffMember: SalesStaffMember) => {
    setFormData({
      username: staffMember.username,
      password: '',
      fullName: staffMember.fullName,
      isActive: staffMember.isActive,
    });
    setEditingStaff(staffMember);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingStaff) {
        // Update existing staff member
        const response = await fetch(`/api/sales-staff/${editingStaff._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            isActive: formData.isActive,
            ...(formData.password && { password: formData.password }),
          }),
        });

        if (response.ok) {
          toast.success('Сотрудник обновлен успешно');
          await fetchStaff();
          setShowAddModal(false);
          resetForm();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Ошибка обновления сотрудника');
        }
      } else {
        // Create new staff member
        const response = await fetch('/api/sales-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success('Сотрудник создан успешно');
          await fetchStaff();
          setShowAddModal(false);
          resetForm();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Ошибка создания сотрудника');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Ошибка отправки формы');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffMember: SalesStaffMember) => {
    if (!confirm(`Удалить сотрудника ${staffMember.fullName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sales-staff/${staffMember._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Сотрудник удален успешно');
        await fetchStaff();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка удаления сотрудника');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Ошибка удаления сотрудника');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Сотрудники отдела продаж
          </h2>
          <p className="text-gray-600">
            Управление аккаунтами сотрудников для системы продаж
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchStaff}
            disabled={loading}
            className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить сотрудника</span>
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Сотрудник
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Логин
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Последний вход
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Создан
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {staff.map(member => (
              <tr key={member._id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.fullName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{member.username}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      member.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {member.isActive ? (
                      <>
                        <UserCheck className="mr-1 h-3 w-3" />
                        Активен
                      </>
                    ) : (
                      <>
                        <UserX className="mr-1 h-3 w-3" />
                        Неактивен
                      </>
                    )}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {member.lastLogin ? formatDate(member.lastLogin) : 'Никогда'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatDate(member.createdAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {staff.length === 0 && (
          <div className="py-12 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Нет сотрудников
            </h3>
            <p className="text-gray-500">
              Создайте первого сотрудника для доступа к системе продаж
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              {editingStaff
                ? 'Редактировать сотрудника'
                : 'Добавить сотрудника'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Полное имя
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, fullName: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {!editingStaff && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Логин
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {editingStaff
                    ? 'Новый пароль (оставьте пустым, чтобы не менять)'
                    : 'Пароль'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required={!editingStaff}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Активный сотрудник
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? 'Сохранение...'
                    : editingStaff
                      ? 'Обновить'
                      : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
