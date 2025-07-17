# Система Локализации ZerekLab

## Обзор

Проект поддерживает три языка:
- **Русский (ru)** - основной язык
- **Казахский (kk)** - региональный язык
- **Английский (en)** - международный язык

## Архитектура

### 1. Простая система i18n (`lib/i18n.ts`)
- Собственная реализация без внешних библиотек
- Поддержка параметризации переводов
- Функции: `t()`, `useTranslations()`, `getMessages()`

### 2. Структура URL
```
/ru/products     - русская версия
/kk/products     - казахская версия  
/en/products     - английская версия
/products        - редирект на /ru/products
```

### 3. Файлы переводов (`messages/`)
- `ru.json` - русские переводы
- `kk.json` - казахские переводы
- `en.json` - английские переводы

### 4. Компонент переключения языков
- `LanguageSwitcher` - выпадающий список с флагами
- Автоматическое переключение маршрутов
- Сохранение текущей страницы при смене языка

## Структура переводов

```json
{
  "nav": {
    "home": "Главная",
    "products": "Товары"
  },
  "products": {
    "title": "Товары",
    "addToCart": "В корзину"
  }
}
```

## Использование в компонентах

### Server Components
```tsx
import { t, type Locale } from '@/lib/i18n';

export default function Page({ params }: { params: { locale: Locale } }) {
  return <h1>{t('nav.home', params.locale)}</h1>;
}
```

### Client Components
```tsx
'use client';
import { useTranslations } from '@/lib/i18n';

export default function Component({ locale }: { locale: Locale }) {
  const t = useTranslations(locale);
  return <button>{t('products.addToCart')}</button>;
}
```

## База данных

### Многоязычные поля
```typescript
interface IMultilingualText {
  ru: string;
  kk: string; 
  en: string;
}

interface IProduct {
  name: IMultilingualText;
  description: IMultilingualText;
  features: IMultilingualText[];
}
```

### Утилиты
```typescript
// Создание многоязычного текста
createMultilingualText('Русский', 'Қазақша', 'English')

// Получение текста на нужном языке
getLocalizedText(product.name, 'kk') // -> 'Қазақша'
```

## Админ-панель

Для каждого поля продукта нужны три вкладки:
- 🇷🇺 Русский
- 🇰🇿 Қазақша  
- 🇺🇸 English

Кроме полей цена, артикул, количество - они остаются едиными.

## Что реализовано

### ✅ Базовая инфраструктура
- [x] Система переводов
- [x] Middleware для обработки локалей
- [x] Структура URL с локалями
- [x] Компонент переключения языков
- [x] Обновленные модели БД

### ✅ Переводы интерфейса
- [x] Общие элементы (кнопки, заголовки)
- [x] Навигация
- [x] Продукты и фильтры
- [x] Корзина
- [x] Админ-панель
- [x] Формы и ошибки

## Что нужно доделать

### 🔄 Компоненты (требуют обновления)
- [ ] Navbar - добавить переключатель языков
- [ ] ProductGrid - использовать локализованные данные
- [ ] ProductDetailsModal - поддержка многоязычности
- [ ] ProductFilters - локализованные фильтры
- [ ] AdminPanel - формы на трех языках

### 🔄 API
- [ ] Обновить API продуктов для многоязычности
- [ ] Добавить параметр locale в запросы
- [ ] Миграция существующих данных

### 🔄 Страницы
- [ ] Главная страница
- [ ] Страница продукта
- [ ] О нас
- [ ] Контакты

## Пример использования

```tsx
// В компоненте страницы
export default function ProductsPage({ 
  params: { locale } 
}: { 
  params: { locale: Locale } 
}) {
  const t = useTranslations(locale);
  
  return (
    <div>
      <h1>{t('products.title')}</h1>
      <LanguageSwitcher currentLocale={locale} />
    </div>
  );
}
```

## Команды

```bash
# Проверка сборки
npm run build

# Запуск разработки  
npm run dev

# Добавление нового перевода
# Отредактируйте файлы в messages/ для всех языков
```

## Следующие шаги

1. Обновить Navbar с переключателем языков
2. Создать многоязычные формы в админке  
3. Мигрировать существующие данные продуктов
4. Обновить все компоненты для поддержки локализации
5. Добавить переводы для всех текстов в интерфейсе 