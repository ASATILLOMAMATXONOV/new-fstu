import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

import '../assets/styles/InternationalDepartmentPage.css';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useContentList } from '../hooks/useContentList';
import { createSafeMarkup, getTranslatedField } from '../utils/cms';

const textOf = (item, field, fallback, language) =>
  getTranslatedField(item, field, fallback || '', language) || fallback || '';

function normalizeLeader(item, language) {
  if (!item) return null;
  const translation = item[language] || item.uz || {};
  return {
    ...item,
    fullName: translation.fullName || [translation.firstName, translation.lastName].filter(Boolean).join(' ') || item.title,
    position: translation.position || item.position || '',
    receptionTime: translation.receptionTime || item.receptionTime || '',
    image: item.image || item.photo || '',
    email: item.email || '',
    phone: item.phone || '',
    telegram: item.telegram || '',
    instagram: item.instagram || ''
  };
}

export default function InternationalDepartmentPage() {
  const { slug = '' } = useParams();
  const { items, loading, currentLanguageCode } = useContentList('international-department', {
    activeOnly: true,
    summaryOnly: false
  });

  const leaderItem = React.useMemo(
    () => items.find((item) => item.entryType === 'leader' && item.active !== false),
    [items]
  );
  const menus = React.useMemo(
    () => items
      .filter((item) => item.entryType === 'menu' && item.active !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [items]
  );
  const activeMenu = React.useMemo(
    () => menus.find((item) => String(item.slug) === String(slug)) || menus[0] || null,
    [menus, slug]
  );
  const ownMenuItems = React.useMemo(() => [
    ...menus.map((item) => ({
      key: String(item.id),
      label: textOf(item, 'title', item.title, currentLanguageCode),
      to: `/international/${item.slug}`,
      end: true,
      isActive: String(item.id) === String(activeMenu?.id)
    })),
    {
      key: 'partners',
      label: currentLanguageCode === 'ru' ? 'Университеты-партнёры' : currentLanguageCode === 'en' ? 'Partner universities' : 'Hamkor universitetlar',
      to: '/partners',
      end: true
    }
  ], [activeMenu, currentLanguageCode, menus]);
  const leader = React.useMemo(
    () => normalizeLeader(leaderItem, currentLanguageCode),
    [currentLanguageCode, leaderItem]
  );

  if (!loading && !slug && activeMenu?.slug) {
    return <Navigate to={`/international/${activeMenu.slug}`} replace />;
  }

  const title = activeMenu ? textOf(activeMenu, 'title', activeMenu.title, currentLanguageCode) : 'Xalqaro bo‘lim';
  const content = activeMenu ? textOf(activeMenu, 'content', '', currentLanguageCode) : '';

  return (
    <main className="international-page">
      <div className="international-page-layout">
        <article className="international-content-card">
          {loading ? (
            <div className="international-loading" aria-label="Yuklanmoqda"><span /><span /><span /></div>
          ) : activeMenu ? (
            <>
              <header className="international-content-head">
                <span>Xalqaro bo‘lim</span>
                <h1>{title}</h1>
              </header>
              <div
                className="international-rich-content"
                dangerouslySetInnerHTML={createSafeMarkup(content, '<p>Ma’lumotlar hali joylanmagan.</p>')}
              />
            </>
          ) : (
            <div className="international-empty">
              <h1>Xalqaro bo‘lim</h1>
              <p>Bo‘lim menyulari va ma’lumotlari hali joylanmagan.</p>
            </div>
          )}
        </article>

        <aside className="international-sidebar-stack">
          <AcademicSidebar
            title="Xalqaro bo‘lim"
            items={ownMenuItems}
            useProvidedItemsOnly
            activeKey={activeMenu ? String(activeMenu.id) : ''}
            pageType="international"
            leader={leader}
            leaderTitle="Xalqaro bo‘lim rahbari"
            showLeaderCard={false}
            showLeaderProfileLink={false}
            showAnnouncements={false}
          />
          <AcademicSidebar showLeaderCard={false} showAnnouncements={false} />
        </aside>
      </div>
    </main>
  );
}
