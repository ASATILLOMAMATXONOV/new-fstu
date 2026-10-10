# FSTU Backend

Node.js + Express + PostgreSQL backend for the `frontend` and `admin` apps.

## Features

- JWT login for admin panel
- PostgreSQL-backed CMS-style content storage
- SQL migrations without extra ORM tooling
- Reusable CRUD endpoints for content sections
- Singleton settings endpoint for pages like rector speech

## Setup

1. Copy `.env.example` to `.env`
2. Create a PostgreSQL database
3. Install packages:

```bash
npm install
```

4. Run migrations:

```bash
npm run db:migrate
```

5. Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:3010` by default.

## Default admin

On first boot, the server creates a default super admin from these env vars:

- `DEFAULT_ADMIN_FULL_NAME`
- `DEFAULT_ADMIN_LOGIN`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `SYNC_DEFAULT_ADMIN_ON_BOOT`

Legacy aliases `ADMIN_FULL_NAME`, `ADMIN_LOGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
are also supported.

If `SYNC_DEFAULT_ADMIN_ON_BOOT=true`, startup keeps the bootstrap super admin's
login/email/password synced with the values from `.env`.

Use either `login` or `email` on `POST /api/account/login`.

## Main endpoints

- `GET /health`
- `POST /api/account/login`
- `GET /api/account/me`
- `GET /api/content/:resource`
- `GET /api/content/:resource/:id`
- `POST /api/content/:resource`
- `PUT /api/content/:resource/:id`
- `DELETE /api/content/:resource/:id`
- `GET /api/settings/:key`
- `PUT /api/settings/:key`
- `GET /api/admin-users`
- `POST /api/admin-users`
- `PUT /api/admin-users/:id`
- `DELETE /api/admin-users/:id`

## Supported content resources

- `menus`
- `banners`
- `advantages`
- `news`
- `announcements`
- `students`
- `partners`
- `statistics`
- `pages`
- `faculties`
- `faculty-page-menus`
- `employees-portfolios`

## Payload shape

The content API is intentionally flexible so it can map to the current admin forms.

Example:

```json
{
  "slug": "international-conference",
  "image": "https://example.com/image.jpg",
  "order": 1,
  "active": true,
  "uz": {
    "title": "Sarlavha",
    "content": "<p>Kontent</p>"
  },
  "ru": {
    "title": "Заголовок",
    "content": "<p>Контент</p>"
  },
  "metadata": {
    "link": "https://example.com"
  }
}
```

Language objects like `uz`, `ru`, `en` are automatically stored in `translations`. Any extra top-level fields are stored in `metadata`.
