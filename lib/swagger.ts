import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ZerekLab API',
    version: '1.0.0',
    description:
      'API документация для интернет-магазина образовательных наборов ZerekLab',
    contact: {
      name: 'ZerekLab Team',
      email: 'support@zereklab.com',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API сервер',
    },
  ],
  components: {
    securitySchemes: {
      AdminAuth: {
        type: 'http',
        scheme: 'basic',
        description: 'Базовая аутентификация для админ панели',
      },
      SalesAuth: {
        type: 'http',
        scheme: 'basic',
        description: 'Базовая аутентификация для продавцов',
      },
    },
    schemas: {
      Product: {
        type: 'object',
        required: ['name', 'description', 'price', 'category', 'sku'],
        properties: {
          _id: {
            type: 'string',
            description: 'Уникальный идентификатор товара',
          },
          name: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: {
                  ru: { type: 'string' },
                  kk: { type: 'string' },
                  en: { type: 'string' },
                },
              },
            ],
            description: 'Название товара (строка или мультиязычный объект)',
          },
          description: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: {
                  ru: { type: 'string' },
                  kk: { type: 'string' },
                  en: { type: 'string' },
                },
              },
            ],
            description: 'Описание товара (строка или мультиязычный объект)',
          },
          price: {
            type: 'number',
            minimum: 0,
            description: 'Цена товара в тенге',
          },
          salePrice: {
            type: 'number',
            minimum: 0,
            description: 'Цена со скидкой',
          },
          images: {
            type: 'array',
            items: { type: 'string' },
            description: 'Массив URL изображений товара',
          },
          videoUrl: {
            type: 'string',
            description: 'URL видео демонстрации товара (YouTube)',
          },
          category: {
            type: 'string',
            description: 'Категория товара',
          },
          subcategory: {
            type: 'string',
            description: 'Подкатегория товара',
          },
          inStock: {
            type: 'boolean',
            description: 'Наличие товара на складе',
          },
          features: {
            oneOf: [
              {
                type: 'array',
                items: { type: 'string' },
              },
              {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    ru: { type: 'string' },
                    kk: { type: 'string' },
                    en: { type: 'string' },
                  },
                },
              },
            ],
            description: 'Особенности товара',
          },
          specifications: {
            type: 'object',
            additionalProperties: { type: 'string' },
            description: 'Технические характеристики',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Теги для поиска',
          },
          sku: {
            type: 'string',
            description: 'Артикул товара',
          },
          ageRange: {
            type: 'string',
            description: 'Возрастная группа (например, "6-8", "9-12", "13+")',
          },
          difficulty: {
            type: 'string',
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            description: 'Уровень сложности',
          },
          relatedProducts: {
            type: 'array',
            items: { type: 'string' },
            description: 'Связанные товары (ID)',
          },
          stockQuantity: {
            type: 'number',
            minimum: 0,
            description: 'Количество на складе',
          },
          estimatedDelivery: {
            type: 'string',
            description: 'Примерное время доставки',
          },
          dimensions: {
            type: 'object',
            properties: {
              length: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' },
              weight: { type: 'number' },
            },
            description: 'Габариты товара',
          },
          parameters: {
            type: 'object',
            additionalProperties: true,
            description: 'Дополнительные параметры',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата обновления',
          },
        },
      },
      Category: {
        type: 'object',
        required: ['name'],
        properties: {
          _id: {
            type: 'string',
            description: 'Уникальный идентификатор категории',
          },
          name: {
            type: 'object',
            required: ['ru', 'kk', 'en'],
            properties: {
              ru: { type: 'string' },
              kk: { type: 'string' },
              en: { type: 'string' },
            },
            description: 'Название категории на разных языках',
          },
          description: {
            type: 'object',
            properties: {
              ru: { type: 'string' },
              kk: { type: 'string' },
              en: { type: 'string' },
            },
            description: 'Описание категории на разных языках',
          },
          subcategories: {
            type: 'array',
            items: { type: 'string' },
            description: 'Подкатегории',
          },
          parentCategory: {
            type: 'string',
            description: 'Родительская категория',
          },
          parameters: {
            type: 'object',
            additionalProperties: true,
            description: 'Дополнительные параметры',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата обновления',
          },
        },
      },
      Contact: {
        type: 'object',
        required: ['name', 'whatsapp', 'subject', 'message'],
        properties: {
          _id: {
            type: 'string',
            description: 'Уникальный идентификатор обращения',
          },
          name: {
            type: 'string',
            description: 'Имя отправителя',
          },
          whatsapp: {
            type: 'string',
            description: 'Номер WhatsApp',
          },
          subject: {
            type: 'string',
            description: 'Тема обращения',
          },
          message: {
            type: 'string',
            description: 'Текст сообщения',
          },
          status: {
            type: 'string',
            enum: ['new', 'read', 'replied'],
            description: 'Статус обращения',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата обновления',
          },
        },
      },
      Bonus: {
        type: 'object',
        required: ['phone', 'amount'],
        properties: {
          _id: {
            type: 'string',
            description: 'Уникальный идентификатор бонуса',
          },
          phone: {
            type: 'string',
            description: 'Номер телефона клиента',
          },
          name: {
            type: 'string',
            description: 'Имя клиента',
          },
          amount: {
            type: 'number',
            description: 'Количество бонусов',
          },
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['earned', 'spent'],
                  description: 'Тип транзакции',
                },
                amount: {
                  type: 'number',
                  description: 'Сумма транзакции',
                },
                description: {
                  type: 'string',
                  description: 'Описание транзакции',
                },
                date: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Дата транзакции',
                },
                staffId: {
                  type: 'string',
                  description: 'ID сотрудника',
                },
                saleId: {
                  type: 'string',
                  description: 'ID продажи',
                },
              },
            },
            description: 'История транзакций',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата обновления',
          },
        },
      },
      Sale: {
        type: 'object',
        required: ['items', 'totalAmount', 'staffId'],
        properties: {
          _id: {
            type: 'string',
            description: 'Уникальный идентификатор продажи',
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                productName: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' },
                total: { type: 'number' },
              },
            },
            description: 'Товары в продаже',
          },
          totalAmount: {
            type: 'number',
            description: 'Общая сумма продажи',
          },
          staffId: {
            type: 'string',
            description: 'ID сотрудника',
          },
          staffName: {
            type: 'string',
            description: 'Имя сотрудника',
          },
          customerPhone: {
            type: 'string',
            description: 'Телефон клиента',
          },
          customerName: {
            type: 'string',
            description: 'Имя клиента',
          },
          bonusesUsed: {
            type: 'number',
            description: 'Использовано бонусов',
          },
          bonusesEarned: {
            type: 'number',
            description: 'Заработано бонусов',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
        },
      },
      SalesStaff: {
        type: 'object',
        required: ['name', 'username', 'password'],
        properties: {
          _id: {
            type: 'string',
            description: 'Уникальный идентификатор сотрудника',
          },
          name: {
            type: 'string',
            description: 'Имя сотрудника',
          },
          username: {
            type: 'string',
            description: 'Логин сотрудника',
          },
          password: {
            type: 'string',
            description: 'Пароль (хешированный)',
          },
          isActive: {
            type: 'boolean',
            description: 'Активность сотрудника',
          },
          totalSales: {
            type: 'number',
            description: 'Общее количество продаж',
          },
          totalRevenue: {
            type: 'number',
            description: 'Общая выручка',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата обновления',
          },
        },
      },
      Quote: {
        type: 'object',
        required: ['text', 'author'],
        properties: {
          _id: {
            type: 'string',
            description: 'Уникальный идентификатор цитаты',
          },
          text: {
            type: 'object',
            properties: {
              ru: { type: 'string' },
              kk: { type: 'string' },
              en: { type: 'string' },
            },
            description: 'Текст цитаты на разных языках',
          },
          author: {
            type: 'object',
            properties: {
              ru: { type: 'string' },
              kk: { type: 'string' },
              en: { type: 'string' },
            },
            description: 'Автор цитаты на разных языках',
          },
          isActive: {
            type: 'boolean',
            description: 'Активность цитаты',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
        },
      },
      QRAnalytics: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Уникальный идентификатор аналитики',
          },
          qrCode: {
            type: 'string',
            description: 'QR код',
          },
          scannedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Время сканирования',
          },
          userAgent: {
            type: 'string',
            description: 'User Agent браузера',
          },
          ip: {
            type: 'string',
            description: 'IP адрес',
          },
          metadata: {
            type: 'object',
            additionalProperties: true,
            description: 'Дополнительные данные',
          },
        },
      },
      Blog: {
        type: 'object',
        required: ['title', 'slug', 'excerpt', 'content', 'previewImage'],
        properties: {
          _id: {
            type: 'string',
            description: 'Уникальный идентификатор статьи',
          },
          title: {
            type: 'object',
            required: ['ru', 'kk', 'en'],
            properties: {
              ru: { type: 'string', maxLength: 200 },
              kk: { type: 'string', maxLength: 200 },
              en: { type: 'string', maxLength: 200 },
            },
            description: 'Заголовок статьи на разных языках',
          },
          slug: {
            type: 'string',
            pattern: '^[a-z0-9-]+$',
            description: 'URL-friendly идентификатор',
          },
          excerpt: {
            type: 'object',
            required: ['ru', 'kk', 'en'],
            properties: {
              ru: { type: 'string', maxLength: 300 },
              kk: { type: 'string', maxLength: 300 },
              en: { type: 'string', maxLength: 300 },
            },
            description: 'Краткое описание на разных языках',
          },
          content: {
            type: 'object',
            required: ['ru', 'kk', 'en'],
            properties: {
              ru: { type: 'string' },
              kk: { type: 'string' },
              en: { type: 'string' },
            },
            description: 'Основной контент статьи',
          },
          previewImage: {
            type: 'string',
            description: 'URL превью изображения',
          },
          media: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['image', 'video'],
                },
                url: { type: 'string' },
                caption: {
                  type: 'object',
                  properties: {
                    ru: { type: 'string' },
                    kk: { type: 'string' },
                    en: { type: 'string' },
                  },
                },
                alt: { type: 'string' },
              },
            },
            description: 'Медиа файлы в статье',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Теги для фильтрации',
          },
          category: {
            type: 'string',
            description: 'Категория статьи',
          },
          isPublished: {
            type: 'boolean',
            description: 'Статус публикации',
          },
          isFeatured: {
            type: 'boolean',
            description: 'Рекомендуемая статья',
          },
          publishedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата публикации',
          },
          views: {
            type: 'number',
            minimum: 0,
            description: 'Количество просмотров',
          },
          likes: {
            type: 'number',
            minimum: 0,
            description: 'Количество лайков',
          },
          author: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              avatar: { type: 'string' },
            },
            description: 'Автор статьи',
          },
          seoTitle: {
            type: 'object',
            properties: {
              ru: { type: 'string', maxLength: 60 },
              kk: { type: 'string', maxLength: 60 },
              en: { type: 'string', maxLength: 60 },
            },
            description: 'SEO заголовок',
          },
          seoDescription: {
            type: 'object',
            properties: {
              ru: { type: 'string', maxLength: 160 },
              kk: { type: 'string', maxLength: 160 },
              en: { type: 'string', maxLength: 160 },
            },
            description: 'SEO описание',
          },
          relatedPosts: {
            type: 'array',
            items: { type: 'string' },
            description: 'ID связанных статей',
          },
          readingTime: {
            type: 'number',
            minimum: 1,
            description: 'Время чтения в минутах',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата обновления',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Сообщение об ошибке',
          },
          details: {
            type: 'array',
            items: { type: 'string' },
            description: 'Детали ошибки',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Сообщение об успехе',
          },
          success: {
            type: 'boolean',
            description: 'Флаг успешности операции',
          },
        },
      },
      PaginatedProducts: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: { $ref: '#/components/schemas/Product' },
            description: 'Массив товаров',
          },
          pagination: {
            type: 'object',
            properties: {
              currentPage: { type: 'number' },
              totalPages: { type: 'number' },
              totalProducts: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPrevPage: { type: 'boolean' },
              limit: { type: 'number' },
            },
            description: 'Информация о пагинации',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Аутентификация и авторизация',
    },
    {
      name: 'Products',
      description: 'Управление товарами',
    },
    {
      name: 'Categories',
      description: 'Управление категориями',
    },
    {
      name: 'Contact',
      description: 'Обратная связь',
    },
    {
      name: 'Bonuses',
      description: 'Система бонусов',
    },
    {
      name: 'Sales',
      description: 'Продажи',
    },
    {
      name: 'Staff',
      description: 'Управление сотрудниками',
    },
    {
      name: 'Quotes',
      description: 'Цитаты дня',
    },
    {
      name: 'Analytics',
      description: 'Аналитика QR кодов',
    },
    {
      name: 'Upload',
      description: 'Загрузка файлов',
    },
    {
      name: 'Blog',
      description: 'Блог и новости',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./app/api/**/*.ts'],
};

const specs = swaggerJSDoc(options);

export default specs;
