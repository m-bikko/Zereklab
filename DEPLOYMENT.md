# Деплой ZerekLab на Vercel

## Необходимые переменные окружения

После импорта репозитория в Vercel, добавьте следующие переменные окружения в настройках проекта:

### База данных
```
MONGODB_URI=your_mongodb_connection_string
```

### Админские данные
```
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
```

### WhatsApp интеграция
```
NEXT_PUBLIC_WHATSAPP_NUMBER=+77777777777
```

### Cloudinary (для загрузки изображений)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Node окружение
```
NODE_ENV=production
```

## Настройка MongoDB Atlas

1. Создайте кластер на [MongoDB Atlas](https://cloud.mongodb.com/)
2. Создайте пользователя базы данных
3. Добавьте IP адреса Vercel в whitelist (или используйте 0.0.0.0/0 для доступа отовсюду)
4. Скопируйте connection string и вставьте в MONGODB_URI

## Настройка Cloudinary

1. Зарегистрируйтесь на [Cloudinary](https://cloudinary.com/)
2. Перейдите в Dashboard
3. Скопируйте Cloud Name, API Key и API Secret
4. Добавьте их в переменные окружения

## Процесс деплоя

1. Подключите GitHub репозиторий к Vercel
2. Добавьте все переменные окружения
3. Запустите деплой

Проект автоматически соберется и будет доступен по URL от Vercel. 