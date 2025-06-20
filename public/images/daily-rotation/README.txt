Папка для ежедневно ротирующихся изображений - ZerekLab
=====================================================

Инструкции по добавлению изображений:

1. Добавьте изображения в эту папку (public/images/daily-rotation/)
2. Назовите их: image-1.jpg, image-2.png, image-3.webp и т.д.
3. Поддерживаемые форматы: jpg, jpeg, png, webp
4. Максимум 10 изображений (image-1 до image-10)
5. Изображения будут автоматически ротироваться каждый день
6. Если изображение не найдено, будет использоваться default.jpg

Примеры правильных имен файлов:
- image-1.jpg
- image-2.png
- image-3.jpeg
- image-4.webp
- default.jpg (запасное изображение)

Как работает ротация:
- Система вычисляет текущий день года
- Выбирает изображение на основе формулы: (день_года % 10) + 1
- Например, 1 января покажет image-1, 2 января - image-2, и т.д.
- На 11 января снова покажет image-1 (цикл повторяется)

Рекомендации:
- Используйте изображения высокого качества
- Соотношение сторон лучше всего 1:1 (квадратные)
- Размер файла не более 2MB для быстрой загрузки 