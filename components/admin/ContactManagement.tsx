'use client';

import { IContact } from '@/models/Contact';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

import {
  CheckCircle,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  RefreshCw,
  Reply,
  User,
} from 'lucide-react';

interface ContactManagementProps {
  contacts: IContact[];
  loading: boolean;
  onRefresh: () => void;
}

interface ContactsResponse {
  success: boolean;
  data: IContact[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function ContactManagement({
  contacts,
  loading,
  onRefresh,
}: ContactManagementProps) {
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleStatusUpdate = async (contactId: string, newStatus: string) => {
    setUpdatingStatus(contactId);
    const toastId = toast.loading('Обновление статуса...');

    try {
      const response = await fetch('/api/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contactId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Статус успешно обновлен!', { id: toastId });
        onRefresh(); // Refresh the contacts list
      } else {
        toast.error(result.error || 'Ошибка при обновлении статуса', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Ошибка сети при обновлении статуса', { id: toastId });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'read':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'replied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex rounded-full px-2 text-xs font-semibold leading-5';
    switch (status) {
      case 'new':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'read':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'replied':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Новое';
      case 'read':
        return 'Прочитано';
      case 'replied':
        return 'Отвечено';
      default:
        return 'Неизвестно';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredContacts = contacts.filter(contact => {
    if (statusFilter === 'all') return true;
    return contact.status === statusFilter;
  });

  const newContactsCount = contacts.filter(c => c.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Обращения клиентов
          </h2>
          <p className="text-sm text-gray-600">
            Всего обращений: {contacts.length}
            {newContactsCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                {newContactsCount} новых
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="read">Прочитанные</option>
            <option value="replied">Отвеченные</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Отправитель
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-6">
                  Тема
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Статус
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell sm:px-6">
                  Дата
                </th>
                <th className="relative px-3 py-3 sm:px-6">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredContacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:h-10 sm:w-10">
                        <User className="h-4 w-4 text-primary-600 sm:h-5 sm:w-5" />
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <div className="text-xs font-medium text-gray-900 sm:text-sm">
                          {contact.name}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          {contact.subject}
                        </div>
                        <div className="text-xs text-gray-500">
                          {contact.whatsapp}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-900 sm:table-cell sm:px-6">
                    <div className="max-w-xs truncate" title={contact.subject}>
                      {contact.subject}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 sm:px-6">
                    <span className={getStatusBadge(contact.status)}>
                      {getStatusText(contact.status)}
                    </span>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-900 md:table-cell sm:px-6">
                    {formatDate(contact.createdAt!)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium sm:px-6">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Просмотреть"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {contact.status === 'new' && (
                        <button
                          onClick={() => handleStatusUpdate(contact._id!, 'read')}
                          disabled={updatingStatus === contact._id}
                          className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                          title="Отметить как прочитанное"
                        >
                          {updatingStatus === contact._id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      {(contact.status === 'new' || contact.status === 'read') && (
                        <button
                          onClick={() => handleStatusUpdate(contact._id!, 'replied')}
                          disabled={updatingStatus === contact._id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Отметить как отвеченное"
                        >
                          {updatingStatus === contact._id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Reply className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredContacts.length === 0 && (
            <div className="py-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Нет обращений
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'all'
                  ? 'Пока что нет обращений от клиентов.'
                  : `Нет обращений со статусом "${getStatusText(statusFilter)}".`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
              &#8203;
            </span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(selectedContact.status)}
                    <h3 className="ml-2 text-lg font-medium leading-6 text-gray-900">
                      Обращение от {selectedContact.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Закрыть</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      WhatsApp
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      <a 
                        href={`https://wa.me/${selectedContact.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 hover:underline"
                      >
                        {selectedContact.whatsapp}
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Тема
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{selectedContact.subject}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Сообщение
                    </label>
                    <div className="mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-gray-50 p-3">
                      <p className="whitespace-pre-wrap text-sm text-gray-900">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Дата отправки: {formatDate(selectedContact.createdAt!)}</span>
                    <span className={getStatusBadge(selectedContact.status)}>
                      {getStatusText(selectedContact.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <div className="flex space-x-2">
                  {selectedContact.status === 'new' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedContact._id!, 'read');
                        setSelectedContact(null);
                      }}
                      disabled={updatingStatus === selectedContact._id}
                      className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 sm:text-sm"
                    >
                      Отметить как прочитанное
                    </button>
                  )}
                  {(selectedContact.status === 'new' || selectedContact.status === 'read') && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedContact._id!, 'replied');
                        setSelectedContact(null);
                      }}
                      disabled={updatingStatus === selectedContact._id}
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 sm:text-sm"
                    >
                      Отметить как отвеченное
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 