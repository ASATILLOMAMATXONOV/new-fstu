# Xavfsizlik tekshiruvi — 2026-11-05

Admin menyusi oxiridagi **Kiberxavfsizlik** (`/cybersecurity`) faqat super admin
uchun ochiq. Hodisalar va vaqtinchalik IP bloklari PostgreSQL bazasida saqlanadi.
Sahifa har 15 soniyada yangilanadi; server so‘rovlarni sahifa ochiq bo‘lmasa ham
tekshiradi. Paketlar auditi server ishga tushganda va har 24 soatda bajariladi.

## Bajarilgan ishlar

- IP, vaqt, manzil, HTTP natijasi, xavf turi, chora va urinishlar soni bo‘yicha jurnal.
- Takroriy loginlar, ruxsatsiz amallar, maxfiy fayl qidirish, encoded path traversal,
  URLdagi ayrim SQL/XSS ifodalari va so‘rovlar oqimi uchun himoya.
- Bazada atomik hisoblagichlar, vaqtinchalik avtomatik blok va super admin orqali
  qo‘lda bloklash/ochish. Bu holatlar server qayta ishga tushganda saqlanadi.
- Maxfiy ma’lumotlarsiz jurnal, bir daqiqalik agregatsiya va 30 kunlik saqlash.
- Ommaviy JSON uchun 256 KiB cheklov; katta CMS tanalarini o‘qishdan oldin autentifikatsiya.
- HTML allowlist parser orqali tozalanadi; encoded zararli havolalar, event handlerlar,
  SVG/script/iframe hamda xavfli CSS olib tashlanadi. Oddiy matn, jadvallar va raster rasmlar saqlanadi.
- Majburiy parol + TOTP tekshiruvi, serverdan bekor qilinadigan HttpOnly cookie sessiyalar
  va CSRF himoyasi qo‘shildi. Eski bearer tokenlar qabul qilinmaydi.
- Parol urinishlari hisoblagichi parallel so‘rovlarda atomik yangilanadi; bcrypt uchun
  72 baytlik chegara bir xil tekshiriladi.
- Database TLS yoqilganda sertifikat tekshiruvi majburiy; ulanish va SQL timeoutlari.
- Lokal `.env`dagi qisqa JWT kaliti kuchli tasodifiy kalitga almashtirildi va
  `SYNC_DEFAULT_ADMIN_ON_BOOT=false` qilindi. Avvalgi admin sessiyalari qayta kirishi kerak.
- Paket tuzatishlari qo‘llandi; barcha aniqlangan critical paket topilmalari bartaraf
  etildi. Backend `sharp` 0.35.5 ga yangilandi va PNG/JPEG/WebP transformlari tekshirildi.
  Backend paket auditida hozir 0 ta zaiflik qaytdi.

## Qolgan aniq masalalar

1. Bitta faol hisobda zaif parol aniqlandi va majburiy almashtirish belgisi qo‘yildi.
   Keyingi kirishda egasi yangi parol tanlashi, autentifikatorni ulashi va tiklash
   kodlarini saqlashi kerak. Haqiqiy hisob foydalanuvchi o‘rniga MFAga ulanmagan.
2. Reverse proxy topologiyasi va uning ishonchli IP/CIDR manzillari tasdiqlanmagan.
   Productionda `TRUST_PROXY`ni haqiqiy ingress manzillariga mos sozlash kerak.
   Aks holda barcha mijozlar proksi IP manzilini bo‘lishishi va birgalikda bloklanishi mumkin.
3. Lokal ulanish HTTP orqali ishlaydi. Productionda TLS/HTTPS tugatilishi va proksi
   sarlavhalarni ishonchli almashtirishi tekshirilishi kerak.
4. Oxirgi auditda backendda **0**, adminda **1 high / 4 moderate /
   3 low**, frontendda **10 high / 7 moderate / 16 low** qolgan. Admindagi high topilma
   Vite’ga tegishli; frontenddagi yuqori topilmalar asosan eski CRA build/dev zanjirida.
   Yangi versiyalarga o‘tish alohida moslik tekshiruvi bilan bajarilishi kerak.
   Joriy natijalar panelda paket nomi, xavf darajasi va yangilash holati bilan ko‘rsatiladi.
   Audit ma’lumotlari vaqt o‘tishi bilan o‘zgaradi; paneldagi eng so‘nggi natijani asos qiling.
5. Bu dastur server operatsion tizimini, tarmoqdagi boshqa kompyuterlarni yoki tarmoq
   qatlamidagi DDoSni skanerlamaydi. Tashqi firewall/CDN/WAF va host nazorati alohida
   sozlanadi. URL signaturalari barcha hujumlarni aniqlash kafolati emas.

## Kiberxavfsizlik markazi tartibi yangilandi

- Alohida bo‘limlar: IP faolligi, hodisalar jurnali, bloklangan IP’lar, IP bloklash
  va himoya holati. Asosiy jadval xarita yoki tashqi geolokatsiya xizmatini kutmaydi.
- IP uchun oxirgi amal, manzil, HTTP natijasi, birinchi/oxirgi faollik va oxirgi
  muvaffaqiyatli MFA kirishi ko‘rsatiladi. IP ustiga bosilganda vaqt bo‘yicha tarix ochiladi.
- Faol bloklar alohida sahifalanadi: sabab, kim bloklagani, qo‘yilgan vaqt va tugash
  vaqti bor. Muddati tugagan blokdan keyingi yangi avtomatik blok eski operatorni
  yoki eski boshlanish vaqtini meros olmaydi.
- Qo‘lda bloklash hodisasi hujumchining so‘rovi deb hisoblanmaydi; haqiqiy mijoz
  faoliyati va admin boshqaruv amallari alohida talqin qilinadi.
- Haqiqiy HTTP so‘rovlari bilan, izolyatsiyalangan test sxemasida SQL probe →
  takroriy aniqlash → avtomatik blok → keyingi oddiy API so‘rovining rad etilishi
  tekshirildi. So‘rov oqimi, qo‘lda blok/ochish, IPv6, sahifalash, filtrlar,
  blok muddati va maxfiy ma’lumotlarni jurnalga yozmaslik ham tekshirildi.
- Yakuniy backend suite: **85/85**. Admin ESLint: xatosiz; production build muvaffaqiyatli.
  Soxta API bilan JSDOM tekshiruvi IP tarixi, alohida blok formasi va ro‘yxati,
  CSRF sarlavhasi, blokni ochish tasdig‘i hamda eskirgan ma’lumot xatosini tekshirdi.
  Bu haqiqiy brauzerda vizual tekshiruv o‘rnini bosmaydi. Testlar real hisoblar
  yoki real foydalanuvchi IP’larini bloklamadi.

## Avvalgi tekshiruv dalillari

- Backend: **79/79 test o‘tdi** (`SECURITY_DB_TESTS=1`, test uchun
  `ASSISTANT_SPEECH_FALLBACK=disabled`), jumladan haqiqiy PostgreSQL’dagi alohida tasodifiy
  sxemada ruxsatlar, IP soxtalashtirish, bloklash, tranzaksiya rollback, retention,
  login jurnali va so‘rov hajmlari tekshirildi. MFA uchun 21 ta kriptografiya va integratsiya
  testi enrollment, recovery, qayta ishlatish, parallel kirish, bloklash, CSRF va sessiyani
  bekor qilishni tekshirdi. Testlar haqiqiy hisoblarni o‘zgartirmadi. Alohida hisob auditida
  bitta real hisobga majburiy parol almashtirish belgisi qo‘yildi.
- Frontend: **148/148 test o‘tdi**. Admin lint tekshiruvida xato yo‘q.
- Admin va frontend production buildlari muvaffaqiyatli yig‘ildi.
- `010`–`013` xavfsizlik migratsiyalari lokal bazaga qo‘llandi; lokal API yangi xavfsizlik
  middleware’i bilan ishga tushirildi. Himoyalangan endpoint avtorizatsiyasiz 401
  va no-store sarlavhalarini qaytaradi.
- Vizual brauzer tekshiruvi bajarilmadi: Windows vositasi joriy URLni ishonchli
  aniqlay olmagani uchun tekshiruvni to‘xtatdi. UI ko‘rinishi vizual tasdiqlangan deb baholanmaydi.
- Admin production va dev modullari JSDOM muhitida xatosiz render qilindi. Soxta API bilan
  parol almashtirish, QR bosqichi, xato OTPdan keyin qayta urinish va tiklash kodlarini
  saqlash tasdig‘i tekshirildi. Haqiqiy hisobning QR yoki tiklash kodlari olinmadi.

Haqiqiy hisob egasi keyingi kirishda yangi kuchli parol tanlab, telefonidagi TOTP
ilovasini ulashi va o‘nta tiklash kodini alohida xavfsiz joyda saqlashi kerak. Production
uchun alohida barqaror `MFA_ENCRYPTION_KEY` siri, HTTPS va ishonchli ingress sozlamasi
hali deployment muhitida berilishi kerak. Lokal ish productionga joylanmadi.

Jurnal va proksi ishonchi uchun asoslar:
[OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html),
[Express behind proxies](https://expressjs.com/en/guide/behind-proxies/).
Ishga tushirish, cheklovlar va blokdan tiklash tartibi [README](README.md#cybersecurity-monitoring)da.
