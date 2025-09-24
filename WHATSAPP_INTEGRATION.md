# WhatsApp Integration Documentation

## Overview
The ZerekLab shop now includes comprehensive WhatsApp integration for order processing. Customers can order products directly through WhatsApp with pre-formatted messages containing product details.

## Features

### 1. Cart Order via WhatsApp
- **Location**: Shopping cart modal
- **Function**: "Оформить заказ" button redirects to WhatsApp with full cart content
- **Message Format**: Includes all cart items with quantities, prices, SKUs, and total amount

### 2. Single Product Order via WhatsApp
- **Location**: Product detail page, product grid, product modal
- **Function**: "Заказать по WhatsApp" button creates single-item order
- **Message Format**: Same format as cart but for single product

## Technical Implementation

### Core Functions
- `createWhatsAppOrderMessage()` - Formats cart items into localized message
- `createWhatsAppOrderUrl()` - Creates WhatsApp URL with encoded message
- `openWhatsAppOrder()` - Opens WhatsApp with formatted order

### Multilingual Support
Messages are automatically translated based on current locale:
- **Russian**: Default language with formal greeting
- **Kazakh**: Native translation with appropriate greeting
- **English**: International version for English speakers

### Message Format Example (Russian)
```
Здравствуйте! Я хочу заказать следующие товары:

1. Робототехнический набор
   Количество: 2
   Цена: 25,000 ₸
   SKU: ROB-001

2. Набор для программирования
   Количество: 1
   Цена: 15,000 ₸
   SKU: PROG-002

Общая сумма: 65,000 ₸

Пожалуйста, подтвердите заказ и сообщите о сроках доставки.
Спасибо!
```

## Configuration

### Environment Variables
Set the following in your `.env.local` file:
```
NEXT_PUBLIC_WHATSAPP_NUMBER=77753084648
```

### Default WhatsApp Number
If environment variable is not set, defaults to: `77753084648`

## Usage for Customers

### Ordering from Cart
1. Add products to cart
2. Open cart modal
3. Click "Оформить заказ" button
4. WhatsApp opens with pre-filled order message
5. Send message to complete order

### Ordering Single Product
1. Browse products
2. Click "Заказать по WhatsApp" on any product
3. WhatsApp opens with single product order
4. Send message to complete order

## Error Handling
- Graceful fallback to simple message format if main function fails
- Console error logging for debugging
- User-friendly error messages in local language

## Testing
Visit `/test-whatsapp` page to test:
- Message generation in different languages
- WhatsApp URL creation
- Direct WhatsApp opening

## Benefits
1. **Seamless Ordering**: Direct connection between product selection and order
2. **Multilingual**: Automatic message translation
3. **Detailed Orders**: Complete product information in WhatsApp message
4. **Fallback Support**: Works even if JavaScript fails
5. **Consistent Format**: Unified message format across all order types

## Future Enhancements
- Contact form integration (already implemented)
- Admin contact management (already implemented)
- Customer information pre-filling
- Order tracking via WhatsApp 