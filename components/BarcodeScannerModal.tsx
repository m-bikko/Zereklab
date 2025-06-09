'use client';

import { useRef, useState } from 'react';

import { AlertCircle, ScanLine, X } from 'lucide-react';

interface Props {
  onScan: (barcode: string) => void;
}

export default function BarcodeScannerModal({ onScan }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = (event: React.FormEvent) => {
    event.preventDefault();
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const barcode = input.value.trim();
    if (barcode) {
      setIsOpen(false);
      input.value = '';
      onScan(barcode);
    }
  };

  const openModal = () => {
    setIsOpen(true);
    // Фокус на скрытое поле ввода для сканера
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const closeModal = () => {
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Кнопка для открытия сканера */}
      <button
        onClick={openModal}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600 sm:w-auto"
      >
        <ScanLine className="h-4 w-4" />
        Сканировать
      </button>

      {/* Модальное окно */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            {/* Заголовок с кнопкой закрытия */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Сканирование штрих-кода
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Информационный блок */}
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <h3 className="mb-1 font-medium text-blue-900">
                    Сканер готов к работе
                  </h3>
                  <p className="text-sm text-blue-700">
                    Штрих-код можно сканировать сейчас. Сканер активен и ожидает
                    ввода. Поднесите штрих-код к сканеру или введите код
                    вручную.
                  </p>
                </div>
              </div>
            </div>

            {/* Скрытая форма для сканера */}
            <form onSubmit={handleScan} className="mb-4">
              <input
                ref={inputRef}
                type="text"
                onBlur={() => {
                  // Сохраняем фокус на поле для работы сканера
                  setTimeout(() => {
                    if (inputRef.current && isOpen) {
                      inputRef.current.focus();
                    }
                  }, 100);
                }}
                className="sr-only"
                aria-label="Скрытое поле для ввода штрих-кода"
                placeholder="Сканируйте штрих-код..."
              />
              <button type="submit" className="sr-only">
                Отправить
              </button>
            </form>

            {/* Ручной ввод (дополнительно) */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Или введите код вручную:
              </label>
              <input
                type="text"
                placeholder="Введите штрих-код или SKU..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      setIsOpen(false);
                      onScan(target.value.trim());
                      target.value = '';
                    }
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500">
                Нажмите Enter после ввода кода
              </p>
            </div>

            {/* Кнопки управления */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  // Возвращаем фокус на скрытое поле сканера
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
              >
                <ScanLine className="h-4 w-4" />
                Готов к сканированию
              </button>
            </div>

            {/* Индикатор активности сканера */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-500">Сканер активен</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
