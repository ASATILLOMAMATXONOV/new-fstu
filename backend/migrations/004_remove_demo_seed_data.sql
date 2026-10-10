DELETE FROM site_settings
WHERE key = 'rector-speech'
  AND data -> 'rectorName' ->> 'uz' = 'Prof. Toshpo‘latov Alisher'
  AND data -> 'position' ->> 'uz' = 'Universitet rektori'
  AND data ->> 'image' LIKE 'https://images.unsplash.com/photo-1560250097-0b93528c311a%';

DELETE FROM content_entries
WHERE (
     resource = 'banners'
     AND slug = 'welcome-banner'
     AND title = 'Kelajagingizni FSTU bilan boshlang'
     AND image_url LIKE 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1%'
   )
   OR (
     resource = 'news'
     AND slug = 'modern-laboratories'
     AND title = 'Zamonaviy laboratoriyalar'
     AND image_url LIKE 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3%'
   )
   OR (
     resource = 'announcements'
     AND slug = 'admission-update'
     AND title = 'Qabul jarayonlari bo''yicha e''lon'
     AND image_url LIKE 'https://images.unsplash.com/photo-1523240795612-9a054b0db644%'
   )
   OR (
     resource = 'partners'
     AND slug = 'unesco'
     AND title = 'UNESCO'
     AND image_url LIKE 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_UNESCO%'
     AND metadata ->> 'link' = 'https://www.unesco.org'
   )
   OR (
     resource = 'menus'
     AND (
       (slug = 'menu-university' AND title = 'Universitet')
       OR (slug = 'drop-about' AND title = 'Universitet haqida')
       OR (slug = 'drop-rector' AND title = 'Rektor murojaati')
       OR (slug = 'menu-academic' AND title = 'Akademik')
       OR (slug = 'drop-faculties' AND title = 'Fakultetlar')
       OR (slug = 'drop-departments' AND title = 'Kafedralar')
       OR (slug = 'menu-partners' AND title = 'Xalqaro hamkorlik')
       OR (slug = 'menu-news' AND title = 'Yangiliklar')
     )
   );
