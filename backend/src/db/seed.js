import { closePool, withTransaction } from './pool.js';

const languageKeys = ['uz', 'ru', 'en'];

function localized(title, extra = {}) {
  return languageKeys.reduce((result, language) => {
    result[language] = {
      title,
      ...extra[language]
    };
    return result;
  }, {});
}

function paragraph(text) {
  return `<p>${text}</p>`;
}

async function replaceLegacyBranding(client) {
  await client.query(`
    UPDATE content_entries
    SET
      title = CASE
        WHEN title IS NULL THEN title
        ELSE replace(replace(replace(replace(title, 'KIUF', 'FSTU'), 'kiuf', 'fstu'), 'UKIU', 'FSTU'), 'ukiu', 'fstu')
      END,
      image_url = CASE
        WHEN image_url IS NULL THEN image_url
        ELSE replace(replace(replace(replace(image_url, 'KIUF', 'FSTU'), 'kiuf', 'fstu'), 'UKIU', 'FSTU'), 'ukiu', 'fstu')
      END,
      translations = replace(replace(replace(replace(translations::text, 'KIUF', 'FSTU'), 'kiuf', 'fstu'), 'UKIU', 'FSTU'), 'ukiu', 'fstu')::jsonb,
      metadata = replace(replace(replace(replace(metadata::text, 'KIUF', 'FSTU'), 'kiuf', 'fstu'), 'UKIU', 'FSTU'), 'ukiu', 'fstu')::jsonb,
      updated_at = NOW()
    WHERE
      COALESCE(title, '') ILIKE ANY (ARRAY['%kiuf%', '%ukiu%'])
      OR COALESCE(image_url, '') ILIKE ANY (ARRAY['%kiuf%', '%ukiu%'])
      OR translations::text ILIKE ANY (ARRAY['%kiuf%', '%ukiu%'])
      OR metadata::text ILIKE ANY (ARRAY['%kiuf%', '%ukiu%']);
  `);

  await client.query(`
    UPDATE site_settings
    SET
      data = replace(replace(replace(replace(data::text, 'KIUF', 'FSTU'), 'kiuf', 'fstu'), 'UKIU', 'FSTU'), 'ukiu', 'fstu')::jsonb,
      updated_at = NOW()
    WHERE data::text ILIKE ANY (ARRAY['%kiuf%', '%ukiu%']);
  `);

  await client.query(`
    UPDATE content_entries
    SET translations = translations - 'ko',
        updated_at = NOW()
    WHERE translations ? 'ko';
  `);
}

async function upsertContent(client, entry) {
  const result = await client.query(
    `
      INSERT INTO content_entries
        (resource, slug, title, image_url, sort_order, active, translations, metadata, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, NOW(), NOW())
      ON CONFLICT (resource, slug) WHERE slug IS NOT NULL
      DO UPDATE SET
        title = EXCLUDED.title,
        image_url = EXCLUDED.image_url,
        sort_order = EXCLUDED.sort_order,
        active = EXCLUDED.active,
        translations = EXCLUDED.translations,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING id;
    `,
    [
      entry.resource,
      entry.slug,
      entry.title,
      entry.imageUrl || null,
      entry.sortOrder ?? 0,
      entry.active ?? true,
      JSON.stringify(entry.translations || {}),
      JSON.stringify(entry.metadata || {})
    ]
  );

  return result.rows[0].id;
}

async function upsertSetting(client, key, data) {
  await client.query(
    `
      INSERT INTO site_settings (key, data, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (key)
      DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW();
    `,
    [key, JSON.stringify(data)]
  );
}

async function touchRevision(client) {
  await client.query(`
    INSERT INTO public_site_revisions (key, revision, updated_at)
    VALUES ('site', 1, NOW())
    ON CONFLICT (key)
    DO UPDATE SET revision = public_site_revisions.revision + 1, updated_at = NOW();
  `);
}

async function seedMenus(client) {
  const menuItems = [
    ['home', 'Bosh sahifa', '/'],
    ['about', 'Universitet haqida', '/about'],
    ['admissions', 'Qabul', '/admissions'],
    ['faculties', 'Fakultetlar', '/faculties'],
    ['news', 'Yangiliklar', '/news'],
    ['contact', 'Aloqa', '/contact']
  ];

  for (const [slug, title, url] of menuItems) {
    await upsertContent(client, {
      resource: 'menus',
      slug: `menu-${slug}`,
      title,
      sortOrder: menuItems.findIndex(([itemSlug]) => itemSlug === slug) + 1,
      translations: localized(title),
      metadata: {
        nodeType: 'menu',
        url
      }
    });
  }
}

async function seedHomeContent(client) {
  await upsertContent(client, {
    resource: 'banners',
    slug: 'fstu-main-banner',
    title: 'Kelajagingizni FSTU bilan boshlang',
    imageUrl: '/hero-1-desktop.jpg',
    sortOrder: 1,
    translations: localized('Kelajagingizni FSTU bilan boshlang', {
      uz: {
        subtitle: 'Zamonaviy taʼlim, amaliy bilim va xalqaro imkoniyatlar bir joyda.',
        primaryButtonText: 'Qabul haqida',
        content: paragraph('FSTU talabalar uchun sifatli taʼlim va kasbiy rivojlanish imkoniyatlarini yaratadi.')
      },
      ru: {
        subtitle: 'Современное образование, практические знания и международные возможности.',
        primaryButtonText: 'О приеме',
        content: paragraph('FSTU создает условия для качественного образования и профессионального роста.')
      },
      en: {
        subtitle: 'Modern education, practical knowledge, and international opportunities.',
        primaryButtonText: 'Admissions',
        content: paragraph('FSTU creates opportunities for quality education and professional growth.')
      }
    }),
    metadata: {
      primaryButtonLink: '/admissions'
    }
  });

  await upsertContent(client, {
    resource: 'news',
    slug: 'fstu-welcome',
    title: 'FSTU rasmiy sayti yangilandi',
    imageUrl: '/images/banner/banner-1.png',
    sortOrder: 1,
    translations: localized('FSTU rasmiy sayti yangilandi', {
      uz: {
        content: paragraph('Universitet yangiliklari, eʼlonlari va qabul maʼlumotlari endi yagona platformada jamlandi.')
      },
      ru: {
        content: paragraph('Новости, объявления и информация о приеме теперь доступны на единой платформе.')
      },
      en: {
        content: paragraph('University news, announcements, and admissions information are now available in one place.')
      }
    })
  });

  await upsertContent(client, {
    resource: 'announcements',
    slug: 'fstu-admission',
    title: 'Qabul jarayonlari davom etmoqda',
    imageUrl: '/images/banner/banner-2.png',
    sortOrder: 1,
    translations: localized('Qabul jarayonlari davom etmoqda', {
      uz: {
        content: paragraph('Abituriyentlar qabul bo‘limi orqali hujjat topshirish tartibi haqida batafsil maʼlumot olishlari mumkin.')
      },
      ru: {
        content: paragraph('Абитуриенты могут получить подробную информацию о порядке подачи документов.')
      },
      en: {
        content: paragraph('Applicants can get detailed information about the admission process from the admissions office.')
      }
    })
  });
}

async function seedSettings(client) {
  await upsertSetting(client, 'rector-speech', {
    active: true,
    image: '/images/logo.png',
    rectorName: {
      uz: 'FSTU rektori',
      ru: 'Ректор FSTU',
      en: 'FSTU Rector',
    },
    position: {
      uz: 'Universitet rektori',
      ru: 'Ректор университета',
      en: 'University Rector',
    },
    title: {
      uz: 'Hurmatli talabalar va hamkorlar',
      ru: 'Уважаемые студенты и партнеры',
      en: 'Dear students and partners',
    },
    content: {
      uz: paragraph('FSTU jamoasi sifatli taʼlim, innovatsiya va amaliy natijaga yo‘naltirilgan muhit yaratishga intiladi.'),
      ru: paragraph('Команда FSTU стремится развивать среду качественного образования, инноваций и практических результатов.'),
      en: paragraph('FSTU is committed to quality education, innovation, and practical outcomes.'),
    }
  });
}

export async function runSeed() {
  await withTransaction(async (client) => {
    await replaceLegacyBranding(client);
    await seedMenus(client);
    await seedHomeContent(client);
    await seedSettings(client);
    await touchRevision(client);
  });
}

runSeed()
  .then(async () => {
    console.log('FSTU seed data applied.');
    await closePool();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(`Seed failed: ${error.message}`);
    await closePool();
    process.exit(1);
  });
