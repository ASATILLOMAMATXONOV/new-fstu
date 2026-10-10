# new-fstu2

Loyiha 3 qismdan iborat:

- `backend` - Node.js + Express + PostgreSQL API
- `admin` - Vite asosidagi admin panel
- `frontend` - React asosidagi foydalanuvchi sayti

## Lokal portlar

- `frontend`: `http://localhost:3000`
- `admin`: `http://localhost:3001`
- `backend`: `http://localhost:8564`

## Ishga tushirish

1. `backend/.env.example` dan `backend/.env` yarating
2. `admin/.env.example` dan `admin/.env` yarating
3. `frontend/.env.example` dan `frontend/.env` yarating
4. PostgreSQL bazani tayyorlang
5. `backend` ichida migratsiyani ishga tushiring:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

6. `admin` ichida:

```bash
npm install
npm run start
```

7. `frontend` ichida:

```bash
npm install
npm run start
```

## Render deployment

Repo ichiga `render.yaml` qo'shildi. U quyidagi hosting sxemasiga tayyor:

- `https://new.fstu.uz` -> frontend
- `https://admin.new.fstu.uz` -> admin panel
- `https://api.new.fstu.uz` -> backend API

Render'da:

1. Repo'ni Blueprint sifatida import qiling.
2. `DEFAULT_ADMIN_LOGIN`, `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD` qiymatlarini kiriting.
3. DNS'da quyidagi domainlarni Render servislariga ulang:
   - `new.fstu.uz`
   - `admin.new.fstu.uz`
   - `api.new.fstu.uz`
4. Backend birinchi deploy oldidan `npm run db:migrate && npm run db:seed` bajaradi.

Frontend va admin production build'lari `api.new.fstu.uz` bilan ishlashga moslandi. Agar Render env var berilmasa, custom domain ichida shu API manzil avtomatik ishlatiladi.
