import React from 'react';
import { useLocation } from 'react-router-dom';

import AcademicSidebar from './AcademicSidebar';
import { useContentList } from '../../hooks/useContentList';
import { getTranslatedField } from '../../utils/cms';

function normalizeLeader(item, language) {
  if (!item) return null;
  const translation = item[language] || item.uz || {};
  return {
    ...item,
    fullName: translation.fullName || [translation.firstName, translation.lastName].filter(Boolean).join(' ') || item.title,
    position: translation.position || item.position || '',
    receptionTime: translation.receptionTime || item.receptionTime || '',
    image: item.image || item.photo || ''
  };
}

export default function InternationalSidebar() {
  const { pathname } = useLocation();
  const { items, currentLanguageCode } = useContentList('international-department', {
    activeOnly: true,
    summaryOnly: false
  });
  const leaderItem = items.find((item) => item.entryType === 'leader' && item.active !== false);
  const leader = normalizeLeader(leaderItem, currentLanguageCode);
  const menuItems = items
    .filter((item) => item.entryType === 'menu' && item.active !== false)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((item) => ({
      key: String(item.id),
      label: getTranslatedField(item, 'title', item.title || 'Menu', currentLanguageCode),
      to: `/international/${item.slug}`,
      end: true
    }));

  menuItems.push({
    key: 'partners',
    label: currentLanguageCode === 'ru' ? 'Университеты-партнёры' : currentLanguageCode === 'en' ? 'Partner universities' : 'Hamkor universitetlar',
    to: '/partners',
    end: true,
    isActive: pathname.startsWith('/partners')
  });

  return (
    <>
      <AcademicSidebar
        title="Xalqaro bo‘lim"
        items={menuItems}
        useProvidedItemsOnly
        pageType="international"
        leader={leader}
        leaderTitle="Xalqaro bo‘lim rahbari"
        showLeaderCard={Boolean(leader)}
        showLeaderProfileLink={false}
        showAnnouncements={false}
      />
      <AcademicSidebar showLeaderCard={false} showAnnouncements={false} />
    </>
  );
}
