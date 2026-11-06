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
- **Блог** — короткие заметки с локальными лайками.
- **Контакты** — форма заявки и подписка с защитой от спама.

## Технологии

| Слой | Технологии |
| --- | --- |
| Frontend | Vue 3 (Composition API, `<script setup>`), TypeScript, Vue Router 5, Vite 7 |
| Стили | Tailwind CSS 4 (CSS-first конфигурация через `@tailwindcss/postcss`) |
| Backend | Node.js, Cloudflare Pages Functions (опционально) |
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

api/contact-core.ts   # Обработка формы: валидация → Turnstile → Telegram
server/index.ts       # HTTP-сервер: статика, SPA-fallback, /api/contact
```

**Обработка формы.** Логика вынесена в независимый от платформы модуль, поэтому один и тот же код
работает и в Pages Functions, и в обычном Node-сервере. Заявка проходит валидацию, проверку
Turnstile со сверкой домена и action, затем уходит в Telegram обычным текстом без `parse_mode` —
пользовательский ввод не может внедрить разметку или ссылки. Секреты хранятся только на сервере и
читаются из окружения.

**Безопасность.** Ограничение размера тела запроса, проверка `Origin` и `Content-Type`, строгая
типизация, тесты обработчика на `node:test`. Публичный site key Turnstile — единственное, что
попадает в клиентскую сборку.

## Структура репозитория

```text
.
├── src/                    # Frontend-приложение
├── api/                    # Обработчик формы
├── server/                 # Node-сервер
├── functions/              # Обёртка для Cloudflare Pages
├── public/                 # favicon, _routes.json
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
