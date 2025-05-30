# DTC Mobile App

Мобильное приложение для просмотра новостей и работы с файлами.

## Установка

1. Скачайте APK файл по ссылке: https://drive.google.com/file/d/1-7I3BZZNYO-9MFCOeKEXgDNRPAlmnxRV/view?usp=sharing
2. Установите приложение на ваше Android устройство

## Настройка окружения

1. Скопируйте файл `.env.example` в `.env`:

```bash
cp .env.example .env
```

2. Настройте переменные окружения в `.env`:

### Для эмулятора Android:

Оставьте значения по умолчанию:

```env
EMULATOR_HOST=10.0.2.2
API_PORT=3001
WEB_PORT=5173
```

### Для физического устройства:

1. Узнайте IP адрес вашего компьютера:
   - Windows: `ipconfig` в командной строке
   - Mac/Linux: `ifconfig` в терминале
2. Обновите значение в `.env`:

```env
DEVICE_HOST=YOUR_IP_ADDRESS
```

## Запуск проекта

### Сервер

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm run server
```

### Веб-приложение

```bash
# В отдельном терминале
npm run web
```

### Мобильное приложение

```bash
# В отдельном терминале
npm start
# или
expo start
```
