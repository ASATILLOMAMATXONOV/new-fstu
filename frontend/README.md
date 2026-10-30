# FSTU frontend

Sayt React va Create React App (`react-scripts`) orqali ishlaydi.
Kirish nuqtasi: `src/index.js`; sahifa marshrutlari: `src/App.js`.

```sh
npm ci
npm start
npm run build
npm test -- --watchAll=false --runInBand
```

API manzili `.env` ichidagi `REACT_APP_API_URL` orqali sozlanadi.
Lokal backend odatda `http://localhost:8564` manzilida ishlaydi.

Sahifalar alohida JavaScript qismlari sifatida yuklanadi. Bosh sahifaning
pastki bo‘limlari ekranga yaqinlashganda yuklanadi. CMS so‘rovlari umumiy
keshdan foydalanadi; ma’lumot yangilanishi har 30 soniyada va oynaga
qaytilganda tekshiriladi. Sessiya keshi 1 MB bilan cheklangan.

`ScrollManager` sahifa, qidiruv parametrlari va tarix yozuvi o‘zgarganda
sahifani yuqoridan ochadi. `InnerPageBanner` joriy sahifa nomini uch tilda,
tafsilot sahifalarida esa CMSdagi sarlavhani ko‘rsatadi.

`public/maps/countries.geo.json` hamkorlar xaritasiga,
`public/manifest.json` sayt manifestiga kerak. Ular ishlatiladigan fayllar.
Jurnallar sahifasi `issues` orqali haqiqiy ma’lumotlarni qabul qiladi;
ma’lumot bo‘lmasa bo‘sh holatni ko‘rsatadi.
