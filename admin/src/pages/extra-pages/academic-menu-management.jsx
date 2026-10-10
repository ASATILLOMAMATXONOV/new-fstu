import React from 'react';

import MenuManagementPage from './menu-management';

export default function AcademicMenuManagementPage() {
  return (
    <MenuManagementPage
      contentResource="academic-menus"
      pageTitle="Akademik menyu boshqaruvi"
      pageDescription="Frontenddagi barcha `Akademik menyu` bloklari shu bo‘limdagi menulardan quriladi."
      allowDropdowns={false}
    />
  );
}
