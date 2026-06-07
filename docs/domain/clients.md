# Модуль: Clients

## Доменна логіка
- Клієнт є базовою сутністю екосистеми. [span_15](start_span)Один клієнт може мати багато проєктів[span_15](end_span).
- [span_16](start_span)Видалення клієнта суворо заборонене (delete button disabled), якщо в нього вже є прив'язані проєкти[span_16](end_span).

## UI / UX Правила
- [span_17](start_span)Відображення: повноекранний список[span_17](end_span).
- [span_18](start_span)Мутації: add/edit виконуються виключно через модальні вікна (modal)[span_18](end_span).
- [span_19](start_span)Видалення: тільки з обов'язковим підтвердженням (confirm)[span_19](end_span).
- [span_20](start_span)Інтерфейс: без зайвих дубльованих кнопок[span_20](end_span).

## Технічний стек (Поточний стан)
- [span_21](start_span)База даних: PostgreSQL (Supabase)[span_21](end_span).
- Доступ до даних: Prisma (модель `Client`).
- Обробка логіки: Server Actions (`src/modules/clients/server/`).