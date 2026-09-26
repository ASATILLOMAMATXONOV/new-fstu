import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import { PublicLayout } from '@/layouts/public/PublicLayout';

import { HomePage } from '@/pages/public/HomePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { FacultiesPage } from '@/pages/public/FacultiesPage';
import { FacultyDetailPage } from '@/pages/public/FacultyDetailPage';
import { NewsPage } from '@/pages/public/NewsPage';
import { NewsDetailPage } from '@/pages/public/NewsDetailPage';
import { AdmissionsPage } from '@/pages/public/AdmissionsPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,

    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'faculties',
        element: <FacultiesPage />,
      },
      {
        path: 'faculties/:slug',
        element: <FacultyDetailPage />,
      },
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'news/:slug',
        element: <NewsDetailPage />,
      },
      {
        path: 'admissions',
        element: <AdmissionsPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}