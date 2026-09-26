import { ROUTES } from './routes';

export const MAIN_NAVIGATION = [
  {
    label: 'Bosh sahifa',
    path: ROUTES.home,
  },

  {
    label: 'Universitet',
    children: [
      {
        label: 'Universitet haqida',
        path: ROUTES.about,
      },
      {
        label: 'Rahbariyat',
        path: '/leadership',
      },
      {
        label: 'Tuzilma',
        path: '/structure',
      },
    ],
  },

  {
    label: 'Ta’lim',
    children: [
      {
        label: 'Fakultetlar',
        path: ROUTES.faculties,
      },
      {
        label: 'Kafedralar',
        path: '/departments',
      },
      {
        label: 'Ta’lim yo‘nalishlari',
        path: '/programs',
      },
    ],
  },

  {
    label: 'Yangiliklar',
    path: ROUTES.news,
  },

  {
    label: 'Talabalar',
    children: [
      {
        label: 'Qabul',
        path: ROUTES.admissions,
      },
      {
        label: 'Talabalar hayoti',
        path: '/students',
      },
      {
        label: 'Stipendiyalar',
        path: '/scholarships',
      },
    ],
  },

  {
    label: 'Bog‘lanish',
    path: ROUTES.contact,
  },
];