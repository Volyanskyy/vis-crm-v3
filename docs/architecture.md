# Архітектура vis-crm-v3

## Стек
- Фреймворк: Next.js (App Router)
- База даних: PostgreSQL (Supabase хостинг)
- ORM: Prisma (з `@prisma/adapter-pg`)
- Стилізація: Tailwind CSS
- Мова: TypeScript

## Структура тек
Проєкт використовує директорію `src/`:
- `/src/app` — роутінг, сторінки, Server Actions для роботи з даними.
- `/src/components` — UI компоненти та модулі екранів.
- `/src/lib` — утиліти та конфігурації (зокрема `prisma.ts`).
- `/prisma` — схема БД (`schema.prisma`) та міграції.
- `/docs` — контекст для Cursor.

## Ключові принципи
1. Доступ до БД — виключно через Prisma.
2. Використовуємо Server Actions для мутацій даних.
3. Дизайн одразу адаптивний: мобільні пристрої -> планшети -> десктоп.