import { DEFAULT_LANGUAGE_CODE, normalizeLanguageCode } from '../utils/language';

const siteMessages = {
  uz: {
    navbar: {
      topbarInfo: {
        location: 'Farg‘ona shahri, A.Navoiy ko‘chasi 55-B uy',
        phone: '+998954019454, +998954019457',
        email: 'info@fstu.uz'
      },
      topbarLinks: {
        lms: 'LMS',
        hemis: 'HEMIS'
      },
      brand: {
        sub: 'Korea International University in Fergana',
      },
      mobileMenu: 'Menu',
      openSectionSuffix: 'bo‘limini ochish'
    },
    academicSidebar: {
      title: 'Akademik menyu',
      announcementsTitle: 'OTM E’lonlari',
      viewAll: 'Barchasi',
      emptyAnnouncements: 'Hozircha e’lonlar mavjud emas.',
      searchPlaceholder: 'Menyudan qidirish',
      searchEmpty: 'Mos menu topilmadi.',
      items: {
        faculties: 'Fakultetlar',
        departments: 'Kafedralar',
        sections: 'Bo‘limlar',
        partners: 'Xalqaro hamkorlik',
        news: 'Yangiliklar'
      }
    },
    pages: {
      dynamicPage: {
        label: 'FSTU SAHIFALARI',
        notFoundTitle: 'Sahifa topilmadi',
        notFoundText: 'So‘ralgan sahifa mavjud emas yoki hozircha faol holatda emas.',
        backHome: 'Bosh sahifaga qaytish',
        intro: 'Ma’lumot sahifada qanday saqlangan bo‘lsa, shu tartibda ko‘rsatiladi.',
        emptyContent: 'Bu sahifa uchun matn hali joylanmagan.'
      },
      menuContent: {
        label: 'MENU MA’LUMOTLARI',
        notFoundTitle: 'Menu topilmadi',
        notFoundText: 'So‘ralgan menu mavjud emas yoki hozircha faol holatda emas.',
        backHome: 'Bosh sahifaga qaytish',
        intro: '',
        emptyContent: 'Bu menu uchun matn hali joylanmagan.'
      },
      linkedInfoTable: {
        eyebrow: 'Tarkibiy sahifalar',
        action: 'O‘tish'
      },
      fileAttachments: {
        eyebrow: 'Biriktirilgan fayllar',
        title: 'Yuklab olish uchun hujjatlar',
        action: 'Yuklab olish',
        typeLabel: 'Turi',
        sizeLabel: 'Hajmi',
        defaultTitle: 'Fayl'
      },
      innerBanner: {
        newsDetail: { eyebrow: 'FSTU YANGILIKLARI', title: 'Yangilik tafsiloti' },
        announcementDetail: { eyebrow: 'FSTU E’LONLARI', title: 'E’lon tafsiloti' },
        dynamicPage: { eyebrow: 'FSTU SAHIFALARI', title: 'Sahifa tafsiloti' },
        menuPage: { eyebrow: 'FSTU MENYUSI', title: 'Menu sahifasi' },
        employeeProfile: { eyebrow: 'HODIMLAR PORTFOLIO', title: 'Hodim profili' },
        newsList: { eyebrow: 'FSTU YANGILIKLARI', title: 'Barcha yangiliklar' },
        announcementsList: { eyebrow: 'FSTU E’LONLARI', title: 'Barcha e’lonlar' },
        admission: { eyebrow: 'QABUL', title: 'Qabul 2024', description: 'Qabul bo‘yicha yangilangan ma’lumotlar bilan tanishing.' },
        partners: { eyebrow: 'XALQARO HAMKORLIK', title: 'Global ta’lim hamkorlari' },
        facultyDetail: { eyebrow: 'AKADEMIK TUZILMA', title: 'Fakultet sahifasi' },
        departmentDetail: { eyebrow: 'AKADEMIK TUZILMA', title: 'Kafedra sahifasi' },
        sectionDetail: { eyebrow: 'UNIVERSITET BO‘LIMLARI', title: 'Bo‘lim sahifasi' },
        academicBreadcrumbs: {
          faculty: 'Fakultetlar sahifasi',
          department: 'Kafedralar sahifasi',
          section: 'Bo‘limlar sahifasi'
        },
        sectionsList: { eyebrow: 'UNIVERSITET BO‘LIMLARI', title: 'Barcha bo‘limlar' },
        facultiesList: { eyebrow: 'AKADEMIK TUZILMA', title: 'Barcha fakultetlar' },
        departmentsList: { eyebrow: 'AKADEMIK TUZILMA', title: 'Fakultetlar va kafedralar' },
        students: { eyebrow: 'FSTU TALABALARI', title: 'Bizning talabalarimiz' },
        rector: { eyebrow: 'UNIVERSITET RAHBARIYATI', title: 'Ochiq muloqot — ishonchli kelajak asosi' },
        default: { eyebrow: 'FSTU', title: 'Universitet sahifasi' }
      },
      facultiesList: {
        itemPrefix: 'Fakultet',
        details: 'Batafsil'
      },
      sectionsList: {
        eyebrow: 'UNIVERSITET BO‘LIMLARI',
        title: 'Barcha bo‘limlar',
        description: 'Universitet tarkibidagi bo‘limlar haqida batafsil ma’lumotlar bilan tanishing.',
        emptyTitle: 'Bo‘limlar hali joylanmagan',
        emptyText: 'Admin panelga bo‘limlar qo‘shilgach, ular ushbu sahifada ro‘yxat bo‘lib ko‘rinadi.',
        placeholder: 'Bo‘lim',
        badge: 'Bo‘lim',
        openLabel: 'Bo‘lim sahifasini ochish',
        details: 'Batafsil ko‘rish',
        previous: 'Oldingi',
        next: 'Keyingi'
      },
      departmentsList: {
        departmentsCount: (count) => `${count} ta kafedra faoliyat yuritadi`,
        openFaculty: 'Fakultet sahifasini ochish',
        openDepartment: 'Kafedra sahifasini ochish'
      },
      academicEntity: {
        meta: {
          faculty: {
            eyebrow: 'AKADEMIK TUZILMA',
            label: 'Fakultet',
            backLabel: 'Barcha fakultetlar',
            emptyTitle: 'Fakultet topilmadi'
          },
          department: {
            eyebrow: 'AKADEMIK TUZILMA',
            label: 'Kafedra',
            backLabel: 'Barcha kafedralar',
            emptyTitle: 'Kafedra topilmadi'
          },
          section: {
            eyebrow: 'UNIVERSITET BO‘LIMI',
            label: 'Bo‘lim',
            backLabel: 'Barcha bo‘limlar',
            emptyTitle: 'Bo‘lim topilmadi'
          }
        },
        panelFallbackTitle: 'Bo‘lim',
        summary: {
          pageType: 'Sahifa turi',
          departments: 'Kafedralar',
          attachedMenu: 'Biriktirilgan menu',
          faculty: 'Fakultet',
          status: 'Holati',
          active: 'Faol',
          inactive: 'Nofaol'
        },
        emptyDepartments: 'Bu fakultet uchun hozircha kafedralar joylanmagan.',
        departmentBadge: 'Kafedra',
        departmentDescriptionFallback: 'Kafedra sahifasi orqali batafsil ma’lumotni ko‘rishingiz mumkin.',
        attachedDepartmentsLabel: 'Biriktirilgan kafedralar',
        attachedDepartmentsTitle: 'Kafedralar ro‘yxati',
        attachedDirectionsTitle: "Biriktirilgan yo'nalishlar",
        directionsPanelTitle: "Yo'nalishlar",
        emptyDirections: "Bu kafedra uchun hozircha yo'nalishlar joylanmagan.",
        directionBadge: "Yo'nalish",
        directionLinkLabel: 'Havolani ochish',
        directionEmptyContent: "Bu yo'nalish uchun batafsil ma'lumot hali joylanmagan.",
        directionNoLinkText: 'Havola biriktirilmagan.',
        entityInfoLabel: 'Fakultet ma’lumoti',
        emptyFacultyContent: 'Bu fakultet uchun matn hali joylanmagan.',
        emptyPageContent: 'Bu sahifa uchun matn hali joylanmagan.',
        missingFacultyInfo: 'Ushbu kafedra uchun fakultet ma’lumoti topilmadi.',
        relatedFacultyLabel: 'Tegishli fakultet',
        relatedFacultyFallback: 'Ushbu fakultet haqida batafsil ma’lumot alohida sahifada mavjud.',
        openFacultyPage: 'Fakultet sahifasini ochish',
        emptySections: 'Hozircha bo‘limlar ro‘yxati joylanmagan.',
        sectionBadge: 'Bo‘lim',
        sectionFallback: 'Bo‘lim sahifasida batafsil ma’lumot mavjud.',
        emptyEmployees: 'Bu sahifa uchun hozircha biriktirilgan hodimlar joylanmagan.',
        employeeFallbackPosition: 'Hodim',
        employeeProfileOpen: 'Profilni ko‘rish',
        emptyMenuContent: 'Bu menu uchun matn hali joylanmagan.',
        notFoundText: 'So‘ralgan sahifa mavjud emas yoki hozircha faol holatda emas.',
        pageMenuTitle: 'Sahifa menyusi',
        activeMenuDescription: 'Tanlangan o‘ng menu bo‘limi bo‘yicha ma’lumot quyida ko‘rsatilmoqda.',
        facultyOverviewDescription: 'Avval biriktirilgan kafedralar, uning pastida esa fakultet ma’lumoti ko‘rsatilmoqda.',
        defaultTabTitle: 'Ma’lumotlar',
        facultyAboutTitle: 'Fakultet haqida',
        lastUpdatedLabel: 'So‘nggi yangilanish',
        leaderCardTitles: {
          faculty: 'Fakultet dekani',
          department: 'Kafedra mudiri',
          section: 'Bo‘lim boshlig‘i'
        },
        leaderInlineLabels: {
          faculty: 'Dekan',
          department: 'Kafedra mudiri',
          section: 'Bo‘lim boshlig‘i'
        },
        leaderInfoTitle: 'Ma’lumotlar',
        leaderInfoPositionLabel: 'Lavozim',
        leaderInfoPhoneLabel: 'Telefon',
        leaderInfoEmailLabel: 'Email',
        leaderInfoReceptionLabel: 'Qabul vaqti',
        leaderInfoTelegramLabel: 'Telegram',
        leaderInfoInstagramLabel: 'Instagram',
        leaderContactMissing: 'Ma’lumotlar hali joylanmagan',
        leaderEmptyText: 'Rahbar ma’lumoti hali joylanmagan.',
        leaderProfileAction: 'Batafsil',
        menuFilesEyebrow: 'Biriktirilgan fayllar',
        menuFilesTitle: 'Yuklab olish uchun hujjatlar',
        menuFilesAction: 'Yuklab olish',
        menuFilesTypeLabel: 'Turi',
        menuFilesSizeLabel: 'Hajmi',
        pageOverviewDescription: (label) => `${label} sahifasining asosiy ma’lumoti quyida ko‘rsatilmoqda.`
      },
      partnersPage: {
        heroDescription: 'FSTU Janubiy Koreyaning yetakchi universitetlari bilan akademik hamkorlik, almashinuv dasturlari va ilmiy loyihalarni rivojlantirib bormoqda.',
        heroAction: 'Hamkorlarni ko‘rish',
        partnersStat: 'Hamkor universitet',
        secondaryStat: 'Akademik yo‘nalish',
        listEyebrow: 'HAMKORLAR RO‘YXATI',
        listTitle: 'Universitetlar',
        listDescription: 'Har bir hamkor universitet kartasidan uning rasmiy veb-saytiga o‘tishingiz mumkin.',
        partnerBadge: 'Hamkor universitet',
        officialSite: 'Rasmiy sayt',
        formatsEyebrow: 'HAMKORLIK YO‘NALISHLARI',
        formatsTitle: 'Asosiy formatlar',
        formatsDescription: 'Xalqaro aloqalar universitetning ilmiy, o‘quv va amaliy faoliyatida muhim o‘rin egallaydi.',
        collaborationAreas: [
          'Akademik almashinuv va qo‘shma dasturlar',
          'Professor-o‘qituvchilar bilan tajriba almashish',
          'Tadqiqot va innovatsion loyihalarda muloqot',
          'Talabalar uchun xalqaro ta’lim muhiti'
        ]
      },
      newsList: {
        details: 'Batafsil',
        previous: 'Oldingi',
        next: 'Keyingi'
      },
      newsDetail: {
        notFoundTitle: 'Yangilik topilmadi',
        backToList: 'Barcha yangiliklar',
        label: 'FSTU YANGILIKLARI',
        emptyContent: 'Yangilik matni mavjud emas.'
      },
      announcementsList: {
        eyebrow: 'FSTU E’LONLARI',
        title: 'Barcha e’lonlar',
        description: 'Universitetga oid rasmiy e’lonlar va muhim xabarlar.',
        details: 'Batafsil',
        previous: 'Oldingi',
        next: 'Keyingi'
      },
      announcementDetail: {
        notFoundTitle: 'E’lon topilmadi',
        backToList: 'Barcha e’lonlar',
        label: 'Rasmiy e’lon',
        emptyContent: 'E’lon matni mavjud emas.'
      },
      studentsPage: {
        eyebrow: 'FSTU TALABALARI',
        title: 'Bizning talabalarimiz',
        description: 'FSTU talabalari o‘z yo‘nalishida bilim, amaliy tajriba va xalqaro imkoniyatlar orqali rivojlanmoqda.',
        emptyTitle: 'Talabalar hali joylanmagan',
        emptyText: 'Admin panelga talabalar qo‘shilgach, ularning rasmi, yo‘nalishi va fikrlari shu sahifada ko‘rinadi.',
        previewFallback: 'Talaba fikri tez orada shu yerda ko‘rinadi.',
        featuredLabel: 'Tanlangan talaba',
        studentsCountLabel: 'Jami talabalar',
        currentPageLabel: 'Joriy sahifa',
        currentViewLabel: 'Ko‘rsatilmoqda',
        latestStoriesLabel: 'Talabalar hikoyalari',
        openProfileLabel: 'Profilni ochish',
        open: 'Batafsil',
        close: 'Yopish',
        emptyContent: 'Talaba fikri kiritilmagan.'
      },
      employeeProfilePage: {
        eyebrow: 'HODIMLAR PORTFOLIO',
        notFoundTitle: 'Profil topilmadi',
        notFoundText: 'So‘ralgan hodim profili mavjud emas yoki hozircha faol holatda emas.',
        backHome: 'Bosh sahifaga qaytish',
        homeLabel: 'Bosh sahifa',
        attachedFacultyPage: 'Fakultet sahifasi',
        attachedDepartmentPage: 'Kafedra sahifasi',
        attachedSectionPage: 'Bo‘lim sahifasi',
        attachLabels: {
          faculty: 'Fakultet',
          department: 'Kafedra',
          section: 'Bo‘lim'
        },
        profileFallback: 'Hodim profili',
        profileSectionLabel: 'PROFILE',
        emptyContent: 'Bu hodim uchun batafsil ma’lumot hali joylanmagan.',
        portfolioBadge: 'Portfolio',
        portfolioTitle: 'Hodim profili',
        portfolioDescription: 'Tanlangan hodimning lavozimi, bog‘langan sahifasi va batafsil ma’lumotlari shu yerda ko‘rsatiladi.',
        telegram: 'Telegram',
        instagram: 'Instagram'
      },
      admissionPage: {
        label: 'QABUL 2024',
        title: 'Qabul 2024',
        description: 'Admin panelda kiritilgan qabul bo‘yicha ma’lumotlar shu sahifada ko‘rsatiladi.',
        emptyContent: 'Qabul bo‘yicha ma’lumot hali joylanmagan.',
        action: 'Ariza topshirish'
      }
    },
    home: {
      heroBanner: {
        primaryButton: 'Batafsil',
        secondaryButton: 'Ko‘rish',
        previousSlide: 'Oldingi slayd',
        nextSlide: 'Keyingi slayd'
      },
      heroFeatures: {
        ariaLabel: 'FSTU afzalliklari'
      },
      homeInfo: {
        newsTitle: 'Yangiliklar',
        directionsTitle: 'Yo‘nalishlar',
        seeAll: 'Barchasi',
        noDate: 'Sana yo‘q',
        newsEmptyTitle: 'Yangiliklar hali qo‘shilmagan.',
        newsEmptyAction: 'Bo‘limga o‘tish',
        directionsEmptyTitle: 'Yo‘nalishlar hali qo‘shilmagan.',
        directionsEmptyAction: 'Bo‘limga o‘tish',
        directionsPromoTag: 'Yo‘nalishlar',
        directionsPromoTitle: 'Yo‘nalishlar bu yerda ko‘rinadi',
        directionsPromoText:
          'Admin paneldan yo‘nalish qo‘shilgandan keyin ushbu bo‘lim avtomatik yangilanadi.',
        facultyFallbackTitle: 'Fakultet',
        newsFallbackTitle: 'Yangilik',
        admissionTitle: 'Qabul 2024',
        admissionText: 'Hozir ariza topshiring va kelajagingizga ilk qadamni qo‘ying!',
        admissionButton: 'Onlayn ariza',
        detailsAction: 'Batafsil',
        directionPromoFallback: 'Yo‘nalish haqida batafsil ma’lumotni ochishingiz mumkin.',
        directionOrderTag: (order) => `${order}-yo‘nalish`,
        departmentCountTag: (departmentsCount) => `${departmentsCount} ta kafedra`,
        facultyPromoText: (departmentsCount) =>
          `${departmentsCount} ta kafedra bilan ushbu fakultet haqida batafsil ma’lumotni ko‘ring.`
      },
      rector: {
        miniTitle: 'REKTOR MUROJAATI',
        defaultTitle: 'Rektor murojaati',
        defaultExcerpt: 'Rektor murojaati matni tez orada joylanadi.',
        cta: 'Batafsil',
        alt: 'Universitet rektori',
        defaultName: 'Rektor'
      },
      studentAnnouncementStats: {
        announcementsTitle: 'E’lonlar',
        latestAnnouncement: 'Yangi',
        studentsTitle: 'Bizning talabalarimiz',
        seeAll: 'Barchasi',
        announcementsEmptyTitle: 'E’lonlar hozircha mavjud emas',
        announcementsEmptyText: 'Yangi e’lonlar qo‘shilgach shu yerda ko‘rinadi.',
        studentsEmptyTitle: 'Talabalar hali kiritilmagan',
        studentsEmptyText: 'Admin panel orqali qo‘shilgan talabalar shu blokda chiqadi.',
        details: 'Batafsil',
        studentFallback: 'Talaba fikri tez orada joylanadi.'
      },
      partners: {
        sectionLabel: 'Xalqaro hamkorlik',
        sectionTitle: 'Xalqaro hamkorlarimiz',
        seeAll: 'Barchasi',
        description:
          'FSTU hamkor universitetlari bilan akademik almashinuv, qo‘shma loyihalar va talabalar uchun xalqaro imkoniyatlarni kengaytirmoqda.',
        ariaLabel: 'Xalqaro hamkorlarimiz',
        siteVisitSuffix: 'saytiga o‘tish',
        logoSuffix: 'logotipi'
      },
      statistics: {
        label: 'QISQACHA RAQAMLAR',
        title: 'Talabalar va Xodimlar hajmi'
      }
    },
    footer: {
      brandDescription:
        'FSTU — O‘zbekiston va Koreya o‘rtasidagi ta’lim ko‘prigi. Zamonaviy ta’lim, xalqaro hamkorlik va kelajak sari ishonchli qadam.',
      columns: [
        {
          title: 'Universitet',
          links: ['Biz haqimizda', 'Rahbariyat', 'Tuzilma', 'Vakansiyalar']
        }
      ],
      contactTitle: 'Aloqa',
      addressLabel: 'Manzil:',
      addressValue: 'Farg‘ona shahri, A.Navoiy ko‘chasi 55-B uy',
      phoneLabel: 'Telefon:',
      phoneValue: '+998954019454, +998954019457',
      emailLabel: 'Email:',
      emailValue: 'info@fstu.uz',
      hoursLabel: 'Ish vaqti:',
      hoursValue: 'Dushanba - Juma, 8:00 dan 18:00 gacha',
      applyButton: 'Onlayn ariza topshirish',
      copyright: '© 2024 FSTU. Barcha huquqlar himoyalangan.',
      privacy: 'Maxfiylik siyosati',
      terms: 'Foydalanish shartlari',
      mapTitle: 'FSTU xaritasi'
    }
  },
  ru: {
    navbar: {
      topbarInfo: {
        location: 'г. Фергана, ул. А. Навои, дом 55-Б',
        phone: '+998954019454, +998954019457',
        email: 'info@fstu.uz'
      },
      topbarLinks: {
        lms: 'LMS',
        hemis: 'HEMIS'
      },
      brand: {
        sub: 'Korea International University in Fergana',
      },
      mobileMenu: 'Меню',
      openSectionSuffix: 'открыть раздел'
    },
    academicSidebar: {
      title: 'Академическое меню',
      announcementsTitle: 'Объявления вуза',
      viewAll: 'Все',
      emptyAnnouncements: 'Объявлений пока нет.',
      searchPlaceholder: 'Поиск по меню',
      searchEmpty: 'Подходящее меню не найдено.',
      items: {
        faculties: 'Факультеты',
        departments: 'Кафедры',
        sections: 'Отделы',
        partners: 'Международное сотрудничество',
        news: 'Новости'
      }
    },
    pages: {
      dynamicPage: {
        label: 'СТРАНИЦЫ FSTU',
        notFoundTitle: 'Страница не найдена',
        notFoundText: 'Запрошенная страница не существует или сейчас неактивна.',
        backHome: 'Вернуться на главную',
        intro: 'Информация отображается в том порядке, в котором она сохранена на странице.',
        emptyContent: 'Для этой страницы текст пока не добавлен.'
      },
      menuContent: {
        label: 'ДАННЫЕ МЕНЮ',
        notFoundTitle: 'Меню не найдено',
        notFoundText: 'Запрошенное меню не существует или сейчас неактивно.',
        backHome: 'Вернуться на главную',
        intro: '',
        emptyContent: 'Для этого меню текст пока не добавлен.'
      },
      linkedInfoTable: {
        eyebrow: 'Структурные страницы',
        action: 'Открыть'
      },
      fileAttachments: {
        eyebrow: 'Прикреплённые файлы',
        title: 'Документы для скачивания',
        action: 'Скачать',
        typeLabel: 'Тип',
        sizeLabel: 'Размер',
        defaultTitle: 'Файл'
      },
      innerBanner: {
        newsDetail: { eyebrow: 'НОВОСТИ FSTU', title: 'Подробности новости' },
        announcementDetail: { eyebrow: 'ОБЪЯВЛЕНИЯ FSTU', title: 'Подробности объявления' },
        dynamicPage: { eyebrow: 'СТРАНИЦЫ FSTU', title: 'Подробности страницы' },
        menuPage: { eyebrow: 'МЕНЮ FSTU', title: 'Страница меню' },
        employeeProfile: { eyebrow: 'ПОРТФОЛИО СОТРУДНИКОВ', title: 'Профиль сотрудника' },
        newsList: { eyebrow: 'НОВОСТИ FSTU', title: 'Все новости' },
        announcementsList: { eyebrow: 'ОБЪЯВЛЕНИЯ FSTU', title: 'Все объявления' },
        admission: { eyebrow: 'ПРИЁМ', title: 'Приём 2024', description: 'Ознакомьтесь с актуальной информацией о приёме.' },
        partners: { eyebrow: 'МЕЖДУНАРОДНОЕ СОТРУДНИЧЕСТВО', title: 'Глобальные образовательные партнёры' },
        facultyDetail: { eyebrow: 'АКАДЕМИЧЕСКАЯ СТРУКТУРА', title: 'Страница факультета' },
        departmentDetail: { eyebrow: 'АКАДЕМИЧЕСКАЯ СТРУКТУРА', title: 'Страница кафедры' },
        sectionDetail: { eyebrow: 'УНИВЕРСИТЕТСКИЕ ОТДЕЛЫ', title: 'Страница отдела' },
        academicBreadcrumbs: {
          faculty: 'Страница факультетов',
          department: 'Страница кафедр',
          section: 'Страница отделов'
        },
        sectionsList: { eyebrow: 'УНИВЕРСИТЕТСКИЕ ОТДЕЛЫ', title: 'Все отделы' },
        facultiesList: { eyebrow: 'АКАДЕМИЧЕСКАЯ СТРУКТУРА', title: 'Все факультеты' },
        departmentsList: { eyebrow: 'АКАДЕМИЧЕСКАЯ СТРУКТУРА', title: 'Факультеты и кафедры' },
        students: { eyebrow: 'СТУДЕНТЫ FSTU', title: 'Наши студенты' },
        rector: { eyebrow: 'РУКОВОДСТВО УНИВЕРСИТЕТА', title: 'Открытый диалог — основа уверенного будущего' },
        default: { eyebrow: 'FSTU', title: 'Страница университета' }
      },
      facultiesList: {
        itemPrefix: 'Факультет',
        details: 'Подробнее'
      },
      sectionsList: {
        eyebrow: 'УНИВЕРСИТЕТСКИЕ ОТДЕЛЫ',
        title: 'Все отделы',
        description: 'Ознакомьтесь с подробной информацией об отделах университета.',
        emptyTitle: 'Отделы пока не размещены',
        emptyText: 'После добавления отделов в админ-панели они появятся на этой странице списком.',
        placeholder: 'Отдел',
        badge: 'Отдел',
        openLabel: 'Открыть страницу отдела',
        details: 'Подробнее',
        previous: 'Предыдущая',
        next: 'Следующая'
      },
      departmentsList: {
        departmentsCount: (count) => `Действует ${count} кафедр`,
        openFaculty: 'Открыть страницу факультета',
        openDepartment: 'Открыть страницу кафедры'
      },
      academicEntity: {
        meta: {
          faculty: {
            eyebrow: 'АКАДЕМИЧЕСКАЯ СТРУКТУРА',
            label: 'Факультет',
            backLabel: 'Все факультеты',
            emptyTitle: 'Факультет не найден'
          },
          department: {
            eyebrow: 'АКАДЕМИЧЕСКАЯ СТРУКТУРА',
            label: 'Кафедра',
            backLabel: 'Все кафедры',
            emptyTitle: 'Кафедра не найдена'
          },
          section: {
            eyebrow: 'УНИВЕРСИТЕТСКИЙ ОТДЕЛ',
            label: 'Отдел',
            backLabel: 'Все отделы',
            emptyTitle: 'Отдел не найден'
          }
        },
        panelFallbackTitle: 'Раздел',
        summary: {
          pageType: 'Тип страницы',
          departments: 'Кафедры',
          attachedMenu: 'Прикреплённое меню',
          faculty: 'Факультет',
          status: 'Статус',
          active: 'Активен',
          inactive: 'Неактивен'
        },
        emptyDepartments: 'Для этого факультета кафедры пока не размещены.',
        departmentBadge: 'Кафедра',
        departmentDescriptionFallback: 'Подробную информацию можно посмотреть на странице кафедры.',
        attachedDepartmentsLabel: 'Прикреплённые кафедры',
        attachedDepartmentsTitle: 'Список кафедр',
        attachedDirectionsTitle: 'Прикреплённые направления',
        directionsPanelTitle: 'Направления',
        emptyDirections: 'Для этой кафедры направления пока не размещены.',
        directionBadge: 'Направление',
        directionLinkLabel: 'Открыть ссылку',
        directionEmptyContent: 'Подробная информация по этому направлению пока не размещена.',
        directionNoLinkText: 'Ссылка не прикреплена.',
        entityInfoLabel: 'Информация о факультете',
        emptyFacultyContent: 'Для этого факультета текст пока не добавлен.',
        emptyPageContent: 'Для этой страницы текст пока не добавлен.',
        missingFacultyInfo: 'Для этой кафедры информация о факультете не найдена.',
        relatedFacultyLabel: 'Связанный факультет',
        relatedFacultyFallback: 'Подробная информация об этом факультете доступна на отдельной странице.',
        openFacultyPage: 'Открыть страницу факультета',
        emptySections: 'Список отделов пока не размещён.',
        sectionBadge: 'Отдел',
        sectionFallback: 'Подробная информация доступна на странице отдела.',
        emptyEmployees: 'Для этой страницы пока не размещены прикреплённые сотрудники.',
        employeeFallbackPosition: 'Сотрудник',
        employeeProfileOpen: 'Открыть профиль',
        emptyMenuContent: 'Для этого меню текст пока не добавлен.',
        notFoundText: 'Запрошенная страница не существует или сейчас неактивна.',
        pageMenuTitle: 'Меню страницы',
        activeMenuDescription: 'Ниже показана информация по выбранному пункту правого меню.',
        facultyOverviewDescription: 'Сначала показаны прикреплённые кафедры, ниже — информация о факультете.',
        defaultTabTitle: 'Информация',
        facultyAboutTitle: 'О факультете',
        lastUpdatedLabel: 'Последнее обновление',
        leaderCardTitles: {
          faculty: 'Декан факультета',
          department: 'Заведующий кафедрой',
          section: 'Руководитель отдела'
        },
        leaderInlineLabels: {
          faculty: 'Декан',
          department: 'Заведующий кафедрой',
          section: 'Руководитель отдела'
        },
        leaderInfoTitle: 'Информация',
        leaderInfoPositionLabel: 'Должность',
        leaderInfoPhoneLabel: 'Телефон',
        leaderInfoEmailLabel: 'Email',
        leaderInfoReceptionLabel: 'Время приёма',
        leaderInfoTelegramLabel: 'Telegram',
        leaderInfoInstagramLabel: 'Instagram',
        leaderContactMissing: 'Информация пока не размещена',
        leaderEmptyText: 'Информация о руководителе пока не размещена.',
        leaderProfileAction: 'Подробнее',
        menuFilesEyebrow: 'Прикреплённые файлы',
        menuFilesTitle: 'Документы для скачивания',
        menuFilesAction: 'Скачать',
        menuFilesTypeLabel: 'Тип',
        menuFilesSizeLabel: 'Размер',
        pageOverviewDescription: (label) => `Ниже показана основная информация страницы «${label}».`
      },
      partnersPage: {
        heroDescription: 'FSTU развивает академическое сотрудничество, программы обмена и научные проекты с ведущими университетами Южной Кореи.',
        heroAction: 'Смотреть партнёров',
        partnersStat: 'Университетов-партнёров',
        secondaryStat: 'Академическое направление',
        listEyebrow: 'СПИСОК ПАРТНЁРОВ',
        listTitle: 'Университеты',
        listDescription: 'С каждой карточки партнёрского университета можно перейти на его официальный сайт.',
        partnerBadge: 'Университет-партнёр',
        officialSite: 'Официальный сайт',
        formatsEyebrow: 'НАПРАВЛЕНИЯ СОТРУДНИЧЕСТВА',
        formatsTitle: 'Основные форматы',
        formatsDescription: 'Международные связи занимают важное место в научной, учебной и практической деятельности университета.',
        collaborationAreas: [
          'Академический обмен и совместные программы',
          'Обмен опытом с профессорско-преподавательским составом',
          'Сотрудничество в исследованиях и инновационных проектах',
          'Международная образовательная среда для студентов'
        ]
      },
      newsList: {
        details: 'Подробнее',
        previous: 'Предыдущая',
        next: 'Следующая'
      },
      newsDetail: {
        notFoundTitle: 'Новость не найдена',
        backToList: 'Все новости',
        label: 'НОВОСТИ FSTU',
        emptyContent: 'Текст новости отсутствует.'
      },
      announcementsList: {
        eyebrow: 'ОБЪЯВЛЕНИЯ FSTU',
        title: 'Все объявления',
        description: 'Официальные объявления и важные сообщения университета.',
        details: 'Подробнее',
        previous: 'Предыдущая',
        next: 'Следующая'
      },
      announcementDetail: {
        notFoundTitle: 'Объявление не найдено',
        backToList: 'Все объявления',
        label: 'Официальное объявление',
        emptyContent: 'Текст объявления отсутствует.'
      },
      studentsPage: {
        eyebrow: 'СТУДЕНТЫ FSTU',
        title: 'Наши студенты',
        description: 'Студенты FSTU развиваются в своём направлении через знания, практический опыт и международные возможности.',
        emptyTitle: 'Студенты пока не размещены',
        emptyText: 'После добавления студентов в админ-панели их фото, направление и отзывы появятся на этой странице.',
        previewFallback: 'Отзыв студента скоро появится здесь.',
        featuredLabel: 'Выбранный студент',
        studentsCountLabel: 'Всего студентов',
        currentPageLabel: 'Текущая страница',
        currentViewLabel: 'Показано',
        latestStoriesLabel: 'Истории студентов',
        openProfileLabel: 'Открыть профиль',
        open: 'Подробнее',
        close: 'Закрыть',
        emptyContent: 'Отзыв студента не добавлен.'
      },
      employeeProfilePage: {
        eyebrow: 'ПОРТФОЛИО СОТРУДНИКОВ',
        notFoundTitle: 'Профиль не найден',
        notFoundText: 'Запрошенный профиль сотрудника не существует или сейчас неактивен.',
        backHome: 'Вернуться на главную',
        homeLabel: 'Главная страница',
        attachedFacultyPage: 'Страница факультета',
        attachedDepartmentPage: 'Страница кафедры',
        attachedSectionPage: 'Страница отдела',
        attachLabels: {
          faculty: 'Факультет',
          department: 'Кафедра',
          section: 'Отдел'
        },
        profileFallback: 'Профиль сотрудника',
        profileSectionLabel: 'PROFILE',
        emptyContent: 'Подробная информация об этом сотруднике пока не добавлена.',
        portfolioBadge: 'Портфолио',
        portfolioTitle: 'Профиль сотрудника',
        portfolioDescription: 'Здесь показаны должность выбранного сотрудника, связанная страница и подробная информация.',
        telegram: 'Telegram',
        instagram: 'Instagram'
      },
      admissionPage: {
        label: 'ПРИЁМ 2024',
        title: 'Приём 2024',
        description: 'Информация о приёме, введённая в админ-панели, отображается на этой странице.',
        emptyContent: 'Информация о приёме пока не добавлена.',
        action: 'Подать заявку'
      }
    },
    home: {
      heroBanner: {
        primaryButton: 'Подробнее',
        secondaryButton: 'Смотреть',
        previousSlide: 'Предыдущий слайд',
        nextSlide: 'Следующий слайд'
      },
      heroFeatures: {
        ariaLabel: 'Преимущества FSTU'
      },
      homeInfo: {
        newsTitle: 'Новости',
        directionsTitle: 'Направления',
        seeAll: 'Все',
        noDate: 'Дата не указана',
        newsEmptyTitle: 'Новости пока не добавлены.',
        newsEmptyAction: 'Перейти в раздел',
        directionsEmptyTitle: 'Направления пока не добавлены.',
        directionsEmptyAction: 'Перейти в раздел',
        directionsPromoTag: 'Направления',
        directionsPromoTitle: 'Направления появятся здесь',
        directionsPromoText:
          'После добавления направлений в админ-панели этот раздел обновится автоматически.',
        facultyFallbackTitle: 'Факультет',
        newsFallbackTitle: 'Новость',
        admissionTitle: 'Приём 2024',
        admissionText: 'Подайте заявку сейчас и сделайте первый шаг к своему будущему!',
        admissionButton: 'Онлайн-заявка',
        detailsAction: 'Подробнее',
        directionPromoFallback: 'Можно открыть подробную информацию по этому направлению.',
        directionOrderTag: (order) => `${order}-е направление`,
        departmentCountTag: (departmentsCount) => `${departmentsCount} кафедр`,
        facultyPromoText: (departmentsCount) =>
          `Ознакомьтесь с факультетом, в составе которого ${departmentsCount} кафедр.`
      },
      rector: {
        miniTitle: 'ОБРАЩЕНИЕ РЕКТОРА',
        defaultTitle: 'Обращение ректора',
        defaultExcerpt: 'Текст обращения ректора скоро будет опубликован.',
        cta: 'Подробнее',
        alt: 'Ректор университета',
        defaultName: 'Ректор'
      },
      studentAnnouncementStats: {
        announcementsTitle: 'Объявления',
        latestAnnouncement: 'Новое',
        studentsTitle: 'Наши студенты',
        seeAll: 'Все',
        announcementsEmptyTitle: 'Объявлений пока нет',
        announcementsEmptyText: 'Новые объявления появятся здесь после добавления.',
        studentsEmptyTitle: 'Студенты ещё не добавлены',
        studentsEmptyText: 'Студенты, добавленные через админ-панель, будут показаны здесь.',
        details: 'Подробнее',
        studentFallback: 'Отзыв студента скоро будет опубликован.'
      },
      partners: {
        sectionLabel: 'Международное сотрудничество',
        sectionTitle: 'Наши международные партнёры',
        seeAll: 'Все',
        description:
          'FSTU расширяет академические обмены, совместные проекты и международные возможности для студентов вместе с университетами-партнёрами.',
        ariaLabel: 'Наши международные партнёры',
        siteVisitSuffix: 'перейти на сайт',
        logoSuffix: 'логотип'
      },
      statistics: {
        label: 'КРАТКИЕ ЦИФРЫ',
        title: 'Масштаб студентов и сотрудников'
      }
    },
    footer: {
      brandDescription:
        'FSTU — образовательный мост между Узбекистаном и Кореей. Современное образование, международное сотрудничество и уверенный шаг в будущее.',
      columns: [
        {
          title: 'Университет',
          links: ['О нас', 'Руководство', 'Структура', 'Вакансии']
        }
      ],
      contactTitle: 'Контакты',
      addressLabel: 'Адрес:',
      addressValue: 'г. Фергана, ул. А. Навои, дом 55-Б',
      phoneLabel: 'Телефон:',
      phoneValue: '+998954019454, +998954019457',
      emailLabel: 'Email:',
      emailValue: 'info@fstu.uz',
      hoursLabel: 'Часы работы:',
      hoursValue: 'Понедельник - Пятница, с 8:00 до 18:00',
      applyButton: 'Подать онлайн-заявку',
      copyright: '© 2024 FSTU. Все права защищены.',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      mapTitle: 'Карта FSTU'
    }
  },
  en: {
    navbar: {
      topbarInfo: {
        location: '55-B A. Navoiy Street, Fergana',
        phone: '+998954019454, +998954019457',
        email: 'info@fstu.uz'
      },
      topbarLinks: {
        lms: 'LMS',
        hemis: 'HEMIS'
      },
      brand: {
        sub: 'Korea International University in Fergana',
      },
      mobileMenu: 'Menu',
      openSectionSuffix: 'open section'
    },
    academicSidebar: {
      title: 'Academic Menu',
      announcementsTitle: 'University Announcements',
      viewAll: 'View all',
      emptyAnnouncements: 'No announcements yet.',
      searchPlaceholder: 'Search menu',
      searchEmpty: 'No matching menu found.',
      items: {
        faculties: 'Faculties',
        departments: 'Departments',
        sections: 'Sections',
        partners: 'International Cooperation',
        news: 'News'
      }
    },
    pages: {
      dynamicPage: {
        label: 'FSTU PAGES',
        notFoundTitle: 'Page not found',
        notFoundText: 'The requested page does not exist or is currently inactive.',
        backHome: 'Back to home',
        intro: 'The information is displayed in the same order it was saved on the page.',
        emptyContent: 'No text has been added for this page yet.'
      },
      menuContent: {
        label: 'MENU CONTENT',
        notFoundTitle: 'Menu not found',
        notFoundText: 'The requested menu does not exist or is currently inactive.',
        backHome: 'Back to home',
        intro: '',
        emptyContent: 'No text has been added for this menu yet.'
      },
      linkedInfoTable: {
        eyebrow: 'Structural pages',
        action: 'Open'
      },
      fileAttachments: {
        eyebrow: 'Attached files',
        title: 'Documents for download',
        action: 'Download',
        typeLabel: 'Type',
        sizeLabel: 'Size',
        defaultTitle: 'File'
      },
      innerBanner: {
        newsDetail: { eyebrow: 'FSTU NEWS', title: 'News details' },
        announcementDetail: { eyebrow: 'FSTU ANNOUNCEMENTS', title: 'Announcement details' },
        dynamicPage: { eyebrow: 'FSTU PAGES', title: 'Page details' },
        menuPage: { eyebrow: 'FSTU MENU', title: 'Menu page' },
        employeeProfile: { eyebrow: 'EMPLOYEE PORTFOLIO', title: 'Employee profile' },
        newsList: { eyebrow: 'FSTU NEWS', title: 'All news' },
        announcementsList: { eyebrow: 'FSTU ANNOUNCEMENTS', title: 'All announcements' },
        admission: { eyebrow: 'ADMISSION', title: 'Admission 2024', description: 'View the latest admission information.' },
        partners: { eyebrow: 'INTERNATIONAL COOPERATION', title: 'Global education partners' },
        facultyDetail: { eyebrow: 'ACADEMIC STRUCTURE', title: 'Faculty page' },
        departmentDetail: { eyebrow: 'ACADEMIC STRUCTURE', title: 'Department page' },
        sectionDetail: { eyebrow: 'UNIVERSITY SECTIONS', title: 'Section page' },
        academicBreadcrumbs: {
          faculty: 'Faculties page',
          department: 'Departments page',
          section: 'Sections page'
        },
        sectionsList: { eyebrow: 'UNIVERSITY SECTIONS', title: 'All sections' },
        facultiesList: { eyebrow: 'ACADEMIC STRUCTURE', title: 'All faculties' },
        departmentsList: { eyebrow: 'ACADEMIC STRUCTURE', title: 'Faculties and departments' },
        students: { eyebrow: 'FSTU STUDENTS', title: 'Our students' },
        rector: { eyebrow: 'UNIVERSITY LEADERSHIP', title: 'Open dialogue is the basis of a confident future' },
        default: { eyebrow: 'FSTU', title: 'University page' }
      },
      facultiesList: {
        itemPrefix: 'Faculty',
        details: 'Details'
      },
      sectionsList: {
        eyebrow: 'UNIVERSITY SECTIONS',
        title: 'All sections',
        description: 'Explore detailed information about the university sections.',
        emptyTitle: 'Sections have not been published yet',
        emptyText: 'Once sections are added in the admin panel, they will appear on this page as a list.',
        placeholder: 'Section',
        badge: 'Section',
        openLabel: 'Open section page',
        details: 'View details',
        previous: 'Previous',
        next: 'Next'
      },
      departmentsList: {
        departmentsCount: (count) => `${count} departments are active`,
        openFaculty: 'Open faculty page',
        openDepartment: 'Open department page'
      },
      academicEntity: {
        meta: {
          faculty: {
            eyebrow: 'ACADEMIC STRUCTURE',
            label: 'Faculty',
            backLabel: 'All faculties',
            emptyTitle: 'Faculty not found'
          },
          department: {
            eyebrow: 'ACADEMIC STRUCTURE',
            label: 'Department',
            backLabel: 'All departments',
            emptyTitle: 'Department not found'
          },
          section: {
            eyebrow: 'UNIVERSITY SECTION',
            label: 'Section',
            backLabel: 'All sections',
            emptyTitle: 'Section not found'
          }
        },
        panelFallbackTitle: 'Section',
        summary: {
          pageType: 'Page type',
          departments: 'Departments',
          attachedMenu: 'Attached menu',
          faculty: 'Faculty',
          status: 'Status',
          active: 'Active',
          inactive: 'Inactive'
        },
        emptyDepartments: 'No departments have been published for this faculty yet.',
        departmentBadge: 'Department',
        departmentDescriptionFallback: 'You can view detailed information on the department page.',
        attachedDepartmentsLabel: 'Attached departments',
        attachedDepartmentsTitle: 'Departments list',
        attachedDirectionsTitle: 'Attached directions',
        directionsPanelTitle: 'Directions',
        emptyDirections: 'No directions have been attached to this department yet.',
        directionBadge: 'Direction',
        directionLinkLabel: 'Open link',
        directionEmptyContent: 'Detailed information for this direction has not been added yet.',
        directionNoLinkText: 'No link attached.',
        entityInfoLabel: 'Faculty information',
        emptyFacultyContent: 'No text has been added for this faculty yet.',
        emptyPageContent: 'No text has been added for this page yet.',
        missingFacultyInfo: 'Faculty information for this department was not found.',
        relatedFacultyLabel: 'Related faculty',
        relatedFacultyFallback: 'Detailed information about this faculty is available on a separate page.',
        openFacultyPage: 'Open faculty page',
        emptySections: 'The sections list has not been published yet.',
        sectionBadge: 'Section',
        sectionFallback: 'Detailed information is available on the section page.',
        emptyEmployees: 'No employees have been attached to this page yet.',
        employeeFallbackPosition: 'Employee',
        employeeProfileOpen: 'View profile',
        emptyMenuContent: 'No text has been added for this menu yet.',
        notFoundText: 'The requested page does not exist or is currently inactive.',
        pageMenuTitle: 'Page menu',
        activeMenuDescription: 'Information for the selected right-side menu section is shown below.',
        facultyOverviewDescription: 'Attached departments are shown first, followed by the faculty information below.',
        defaultTabTitle: 'Information',
        facultyAboutTitle: 'About the faculty',
        lastUpdatedLabel: 'Last updated',
        leaderCardTitles: {
          faculty: 'Faculty dean',
          department: 'Department head',
          section: 'Section head'
        },
        leaderInlineLabels: {
          faculty: 'Dean',
          department: 'Department head',
          section: 'Section head'
        },
        leaderInfoTitle: 'Information',
        leaderInfoPositionLabel: 'Position',
        leaderInfoPhoneLabel: 'Phone',
        leaderInfoEmailLabel: 'Email',
        leaderInfoReceptionLabel: 'Reception hours',
        leaderInfoTelegramLabel: 'Telegram',
        leaderInfoInstagramLabel: 'Instagram',
        leaderContactMissing: 'Information has not been published yet',
        leaderEmptyText: 'Leader information has not been published yet.',
        leaderProfileAction: 'Learn more',
        menuFilesEyebrow: 'Attached files',
        menuFilesTitle: 'Documents for download',
        menuFilesAction: 'Download',
        menuFilesTypeLabel: 'Type',
        menuFilesSizeLabel: 'Size',
        pageOverviewDescription: (label) => `The main information for the ${label} page is shown below.`
      },
      partnersPage: {
        heroDescription: 'FSTU is continuously developing academic cooperation, exchange programs, and research projects with leading universities in South Korea.',
        heroAction: 'View partners',
        partnersStat: 'Partner universities',
        secondaryStat: 'Academic focus',
        listEyebrow: 'PARTNERS LIST',
        listTitle: 'Universities',
        listDescription: 'Each partner university card includes a link to its official website.',
        partnerBadge: 'Partner university',
        officialSite: 'Official site',
        formatsEyebrow: 'COOPERATION AREAS',
        formatsTitle: 'Main formats',
        formatsDescription: 'International relations play an important role in the university’s academic, educational, and practical activities.',
        collaborationAreas: [
          'Academic exchange and joint programs',
          'Experience sharing with faculty members',
          'Collaboration in research and innovation projects',
          'An international learning environment for students'
        ]
      },
      newsList: {
        details: 'Details',
        previous: 'Previous',
        next: 'Next'
      },
      newsDetail: {
        notFoundTitle: 'News not found',
        backToList: 'All news',
        label: 'FSTU NEWS',
        emptyContent: 'News content is not available.'
      },
      announcementsList: {
        eyebrow: 'FSTU ANNOUNCEMENTS',
        title: 'All announcements',
        description: 'Official university announcements and important notices.',
        details: 'Details',
        previous: 'Previous',
        next: 'Next'
      },
      announcementDetail: {
        notFoundTitle: 'Announcement not found',
        backToList: 'All announcements',
        label: 'Official announcement',
        emptyContent: 'Announcement content is not available.'
      },
      studentsPage: {
        eyebrow: 'FSTU STUDENTS',
        title: 'Our students',
        description: 'FSTU students develop in their fields through knowledge, practical experience, and international opportunities.',
        emptyTitle: 'Students have not been published yet',
        emptyText: 'Once students are added in the admin panel, their photos, direction, and feedback will appear on this page.',
        previewFallback: 'Student feedback will appear here soon.',
        featuredLabel: 'Featured student',
        studentsCountLabel: 'Total students',
        currentPageLabel: 'Current page',
        currentViewLabel: 'Shown now',
        latestStoriesLabel: 'Student stories',
        openProfileLabel: 'Open profile',
        open: 'Details',
        close: 'Close',
        emptyContent: 'Student feedback has not been added.'
      },
      employeeProfilePage: {
        eyebrow: 'EMPLOYEE PORTFOLIO',
        notFoundTitle: 'Profile not found',
        notFoundText: 'The requested employee profile does not exist or is currently inactive.',
        backHome: 'Back to home',
        homeLabel: 'Home page',
        attachedFacultyPage: 'Faculty page',
        attachedDepartmentPage: 'Department page',
        attachedSectionPage: 'Section page',
        attachLabels: {
          faculty: 'Faculty',
          department: 'Department',
          section: 'Section'
        },
        profileFallback: 'Employee profile',
        profileSectionLabel: 'PROFILE',
        emptyContent: 'Detailed information for this employee has not been added yet.',
        portfolioBadge: 'Portfolio',
        portfolioTitle: 'Employee profile',
        portfolioDescription: 'The selected employee’s position, attached page, and detailed information are shown here.',
        telegram: 'Telegram',
        instagram: 'Instagram'
      },
      admissionPage: {
        label: 'ADMISSION 2024',
        title: 'Admission 2024',
        description: 'Admission information entered in the admin panel is displayed on this page.',
        emptyContent: 'Admission information has not been added yet.',
        action: 'Apply now'
      }
    },
    home: {
      heroBanner: {
        primaryButton: 'Learn more',
        secondaryButton: 'View',
        previousSlide: 'Previous slide',
        nextSlide: 'Next slide'
      },
      heroFeatures: {
        ariaLabel: 'FSTU advantages'
      },
      homeInfo: {
        newsTitle: 'News',
        directionsTitle: 'Directions',
        seeAll: 'View all',
        noDate: 'No date',
        newsEmptyTitle: 'No news has been added yet.',
        newsEmptyAction: 'Go to section',
        directionsEmptyTitle: 'No directions have been added yet.',
        directionsEmptyAction: 'Go to section',
        directionsPromoTag: 'Directions',
        directionsPromoTitle: 'Directions will appear here',
        directionsPromoText:
          'After directions are added in the admin panel, this section will update automatically.',
        facultyFallbackTitle: 'Faculty',
        newsFallbackTitle: 'News item',
        admissionTitle: 'Admission 2024',
        admissionText: 'Apply now and take the first step toward your future!',
        admissionButton: 'Online application',
        detailsAction: 'Details',
        directionPromoFallback: 'Open the detailed information for this direction.',
        directionOrderTag: (order) => `Direction ${order}`,
        departmentCountTag: (departmentsCount) => `${departmentsCount} departments`,
        facultyPromoText: (departmentsCount) =>
          `Explore this faculty with ${departmentsCount} departments in detail.`
      },
      rector: {
        miniTitle: 'RECTOR’S ADDRESS',
        defaultTitle: 'Rector’s address',
        defaultExcerpt: 'The rector’s message will be published soon.',
        cta: 'Learn more',
        alt: 'University rector',
        defaultName: 'Rector'
      },
      studentAnnouncementStats: {
        announcementsTitle: 'Announcements',
        latestAnnouncement: 'Latest',
        studentsTitle: 'Our students',
        seeAll: 'View all',
        announcementsEmptyTitle: 'No announcements yet',
        announcementsEmptyText: 'New announcements will appear here after they are added.',
        studentsEmptyTitle: 'Students have not been added yet',
        studentsEmptyText: 'Students added through the admin panel will be shown here.',
        details: 'Details',
        studentFallback: 'Student feedback will be published soon.'
      },
      partners: {
        sectionLabel: 'International cooperation',
        sectionTitle: 'Our international partners',
        seeAll: 'View all',
        description:
          'FSTU is expanding academic exchange, joint projects, and international opportunities for students together with partner universities.',
        ariaLabel: 'Our international partners',
        siteVisitSuffix: 'visit website',
        logoSuffix: 'logo'
      },
      statistics: {
        label: 'KEY FIGURES',
        title: 'Student and staff scale'
      }
    },
    footer: {
      brandDescription:
        'FSTU is an educational bridge between Uzbekistan and Korea. Modern education, international cooperation, and a confident step toward the future.',
      columns: [
        {
          title: 'University',
          links: ['About us', 'Management', 'Structure', 'Vacancies']
        }
      ],
      contactTitle: 'Contact',
      addressLabel: 'Address:',
      addressValue: '55-B A. Navoiy Street, Fergana',
      phoneLabel: 'Phone:',
      phoneValue: '+998954019454, +998954019457',
      emailLabel: 'Email:',
      emailValue: 'info@fstu.uz',
      hoursLabel: 'Working hours:',
      hoursValue: 'Monday - Friday, 8:00 to 18:00',
      applyButton: 'Submit online application',
      copyright: '© 2024 FSTU. All rights reserved.',
      privacy: 'Privacy policy',
      terms: 'Terms of use',
      mapTitle: 'FSTU map'
    }
  }
};

export function getSiteMessages(languageCode = DEFAULT_LANGUAGE_CODE) {
  const normalizedCode = normalizeLanguageCode(languageCode);

  return siteMessages[normalizedCode] || siteMessages[DEFAULT_LANGUAGE_CODE];
}
