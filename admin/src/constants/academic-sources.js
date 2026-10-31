const source = (value, uz, ru, en) => ({ value, sourceType: value, label: uz, title: { uz, ru, en }, group: 'Ma’lumotlar' });

export const academicSources = [
  source('faculty', 'Fakultetlar', 'Факультеты', 'Faculties'),
  source('department', 'Kafedralar', 'Кафедры', 'Departments'),
  source('section', 'Bo‘limlar', 'Отделы', 'Sections'),
  source('direction', 'Ta’lim yo‘nalishlari', 'Направления обучения', 'Study programmes'),
  source('news', 'Yangiliklar', 'Новости', 'News'),
  source('announcements', 'E’lonlar', 'Объявления', 'Announcements'),
  source('students', 'Talabalar', 'Студенты', 'Students'),
  source('partners', 'Hamkorlar', 'Партнёры', 'Partners'),
  source('pages', 'Sahifalar', 'Страницы', 'Pages'),
  source('employees', 'Xodimlar', 'Сотрудники', 'Staff'),
  source('statistics', 'Statistika', 'Статистика', 'Statistics'),
  source('banners', 'Bannerlar', 'Баннеры', 'Banners'),
  source('advantages', 'Afzalliklar', 'Преимущества', 'Advantages')
];

export function buildAcademicSourceOptions(siteMenus = []) {
  const seen = new Set();
  const menuOptions = siteMenus
    .filter((item) => item && item.id != null)
    .flatMap((item) => {
      const id = String(item.id);
      if (seen.has(id)) return [];
      seen.add(id);
      const title = Object.fromEntries(
        ['uz', 'ru', 'en'].map((language) => [
          language,
          item[language]?.title || item.translations?.[language]?.title || (language === 'uz' ? item.title : '') || ''
        ])
      );
      const label = title.uz || title.en || title.ru;
      if (!label) return [];
      if (!title.uz) title.uz = label;
      return [{ value: `menu:${id}`, sourceType: 'menu', menuId: id, label, title, group: 'Sayt menyulari' }];
    });
  return [...academicSources, ...menuOptions];
}

export function academicSourceValue(item) {
  return item?.sourceType === 'menu' ? `menu:${item.menuId}` : item?.sourceType || '';
}
