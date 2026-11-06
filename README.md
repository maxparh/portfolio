# Портфолио Максима

Личный сайт-портфолио DevOps, SRE и Full-stack разработчика: проекты, навыки, блог и контакты.

**[maxparh.dev](https://maxparh.dev)** — можно посмотреть выполненные работы, узнать об опыте и
отправить сообщение или запрос на обновления.

## О сайте

На главной странице — интерактивный терминал: по портфолио можно перемещаться командами вместо
кликов. Он не имитация, а рабочий навигационный интерфейс со своей логикой:

```text
~$ > projects -py        # фильтр проектов по типу
~$ > projects -p linqs   # поиск по названию
~$ > open cogito_AI      # переход на страницу проекта
~$ > --help              # список команд
```

Остальные разделы:

- **Проекты** — карточки работ с технологическим стеком, детальная страница с документацией,
  галереей скриншотов и распределением языков.
- **Навыки** — двухпанельный проводник по стеку в стиле файлового менеджера.
- **Блог** — короткие заметки и общий счётчик лайков. Cookie запоминает отметки посетителя.
- **Контакты** — форма заявки и подписка с защитой от спама.

## Технологии

| Слой | Технологии |
| --- | --- |
| Frontend | Vue 3 (Composition API, `<script setup>`), TypeScript, Vue Router 5, Vite 7 |
| Стили | Tailwind CSS 4 (CSS-first конфигурация через `@tailwindcss/postcss`) |
| Backend | Node.js, SQLite, Python-воркер для Telegram |
| Безопасность | Cloudflare Turnstile, валидация на сервере, строгая проверка `Origin` |
| Инфраструктура | Docker (multi-stage), Caddy, GitHub Actions |

Стек намеренно минимальный: без UI-библиотек, стейт-менеджеров и лишних зависимостей — только Vue,
роутер и Tailwind.

## Архитектура

```text
src/
├── views/          # Страницы (Home, Projects, ProjectDetail, Skills, Blog, Contacts)
├── components/     # Header, Footer, Terminal, BlogCard, TurnstileWidget
├── composables/    # useContactForm (отправка форм), useLikedPosts (лайки блога)
├── utils/          # Данные проектов и постов, навигация
├── router/         # Маршруты
├── styles/         # Tailwind + фоновая сетка
└── assets/         # Изображения и иконки

api/contact-core.ts   # Валидация формы и проверка Turnstile
server/index.ts       # API проектов, лайков и контактной формы
server/database.ts    # Миграции SQLite, каталог проектов и очередь заявок
server/form_worker.py # Доставка заявок из очереди в Telegram
```

**Данные и доставка.** Caddy отдаёт Vue-приложение. API читает каталог из SQLite и записывает один
лайк на пару «пост + посетитель». Контактная форма после проверки Turnstile попадает в очередь SQLite.
Python-воркер опрашивает закрытый интерфейс очереди и доставляет заявки в Telegram. При сбое заявка
остаётся в очереди для повторной попытки.

**Безопасность.** Ограничение размера тела запроса, проверка `Origin` и `Content-Type`, строгая
типизация, тесты обработчика на `node:test`. Публичный site key Turnstile — единственное, что
попадает в клиентскую сборку.

## Структура репозитория

```text
.
├── src/                    # Frontend-приложение
├── api/                    # Обработчик формы
├── server/                 # API, SQLite и Python-воркер
├── public/                 # favicon
├── tests/                  # Тесты обработчика
├── deploy/                 # Конфигурация Caddy
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/      # CI: типы, тесты, сборка
```

## Скрипты

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Dev-сервер с горячей заменой модулей |
| `npm run build` | Проверка типов и production-сборка |
| `npm test` | Тесты серверного обработчика |
| `npm run type-check` | Проверка типов frontend и сервера |

## Автор

**Максим Пархоменко** — DevOps / SRE / Full-stack разработчик.

- GitHub: [@maxparh](https://github.com/maxparh)
- GitLab: [@maxparh](https://gitlab.com/maxparh)
- LinkedIn: [maksim-parkhomenko](https://www.linkedin.com/in/maksim-parkhomenko-4465003bb/)

Связаться можно через форму на сайте.
