'use client';

import { IReview } from '@/models/Review';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

import {
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  RefreshCw,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';

interface ReviewManagementProps {
  reviews: IReview[];
  pendingCount: number;
  loading: boolean;
  onRefresh: () => void;
}

export default function ReviewManagement({
  reviews,
  pendingCount,
  loading,
  onRefresh,
}: ReviewManagementProps) {
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (
    reviewId: string,
    newStatus: 'approved' | 'rejected'
  ) => {
    setUpdatingId(reviewId);
    const toastId = toast.loading(
      newStatus === 'approved' ? 'Одобрение отзыва...' : 'Отклонение отзыва...'
    );

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message, { id: toastId });
        onRefresh();
      } else {
        toast.error(result.error || 'Ошибка при обновлении статуса', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Ошибка сети при обновлении статуса', { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

    setUpdatingId(reviewId);
    const toastId = toast.loading('Удаление отзыва...');

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message, { id: toastId });
        setSelectedReview(null);
        onRefresh();
      } else {
        toast.error(result.error || 'Ошибка при удалении отзыва', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Ошибка сети при удалении отзыва', { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      'inline-flex rounded-full px-2 text-xs font-semibold leading-5';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'approved':
        return 'Одобрен';
      case 'rejected':
        return 'Отклонён';
      default:
        return 'Неизвестно';
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredReviews = reviews.filter(review => {
    if (statusFilter === 'all') return true;
    return review.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление отзывами
          </h2>
          <p className="text-sm text-gray-600">
            Всего отзывов: {reviews.length}
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                {pendingCount} ожидают модерации
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидающие</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклонённые</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
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
                  Имя
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Отзыв
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Статус
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6 md:table-cell">
                  Дата
                </th>
                <th className="relative px-3 py-3 sm:px-6">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredReviews.map(review => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:h-10 sm:w-10">
                        <User className="h-4 w-4 text-primary-600 sm:h-5 sm:w-5" />
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <span className="text-xs font-medium text-gray-900 sm:text-sm">
                          {review.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 sm:px-6">
                    <div className="max-w-xs truncate" title={review.content}>
                      {review.content.length > 60
                        ? `${review.content.slice(0, 60)}...`
                        : review.content}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 sm:px-6">
                    <span className={getStatusBadge(review.status)}>
                      {getStatusText(review.status)}
                    </span>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-900 sm:px-6 md:table-cell">
                    {review.createdAt ? formatDate(review.createdAt) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium sm:px-6">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Просмотреть"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(review._id, 'approved')
                            }
                            disabled={updatingId === review._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Одобрить"
                          >
                            {updatingId === review._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(review._id, 'rejected')
                            }
                            disabled={updatingId === review._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Отклонить"
                          >
                            {updatingId === review._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={updatingId === review._id}
                        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReviews.length === 0 && (
            <div className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Нет отзывов
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'all'
                  ? 'Пока что нет отзывов от клиентов.'
                  : `Нет отзывов со статусом "${getStatusText(statusFilter)}".`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
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
                    {getStatusIcon(selectedReview.status)}
                    <h3 className="ml-2 text-lg font-medium leading-6 text-gray-900">
                      Детали отзыва
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Закрыть</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Имя
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReview.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Текст отзыва
                    </label>
                    <div className="mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-gray-50 p-3">
                      <p className="whitespace-pre-wrap text-sm text-gray-900">
                        {selectedReview.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Дата отправки:{' '}
                      {selectedReview.createdAt
                        ? formatDate(selectedReview.createdAt)
                        : 'N/A'}
                    </span>
                    <span className={getStatusBadge(selectedReview.status)}>
                      {getStatusText(selectedReview.status)}
                    </span>
                  </div>

                  {selectedReview.reviewedAt && (
                    <div className="text-sm text-gray-500">
                      Модерация: {formatDate(selectedReview.reviewedAt)}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <div className="flex flex-wrap gap-2">
                  {selectedReview.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedReview._id, 'approved');
                          setSelectedReview(null);
                        }}
                        disabled={updatingId === selectedReview._id}
                        className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 sm:text-sm"
                      >
                        Одобрить
                      </button>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedReview._id, 'rejected');
                          setSelectedReview(null);
                        }}
                        disabled={updatingId === selectedReview._id}
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 sm:text-sm"
                      >
                        Отклонить
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(selectedReview._id)}
                    disabled={updatingId === selectedReview._id}
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 sm:text-sm"
                  >
                    Удалить
                  </button>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:text-sm"
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
