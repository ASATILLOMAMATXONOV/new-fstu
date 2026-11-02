import {
  ApartmentOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  FileImageOutlined,
  FileTextOutlined,
  GlobalOutlined,
  MenuOutlined,
  MessageOutlined,
  NotificationOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';

const homePageManagement = {
  id: 'home-page-management-group',
  title: 'Bosh sahifa',
  type: 'group',
  children: [
    {
      id: 'menu-management',
      title: 'Navbar',
      type: 'item',
      url: '/menu-management',
      icon: MenuOutlined,
      breadcrumbs: false
    },
    {
      id: 'banner-management',
      title: 'Banner',
      type: 'item',
      url: '/banner-management',
      icon: FileImageOutlined,
      breadcrumbs: false
    },
    {
      id: 'advantages-management',
      title: 'Afzalliklar bloki',
      type: 'item',
      url: '/advantages-management',
      icon: AppstoreOutlined,
      breadcrumbs: false
    },
    {
      id: 'rankings-management',
      title: 'Reyting ko‘rsatkichlari',
      type: 'item',
      url: '/rankings-management',
      icon: BarChartOutlined,
      breadcrumbs: false
    },
    {
      id: 'academic-structure-management',
      title: 'Akademik tuzilma',
      type: 'item',
      url: '/academic-structure-management',
      icon: ApartmentOutlined,
      breadcrumbs: false
    },
    {
      id: 'rector-speech-management',
      title: 'Rektor murojaati',
      type: 'item',
      url: '/rector-speech-management',
      icon: MessageOutlined,
      breadcrumbs: false
    },
    {
      id: 'news-management',
      title: 'Yangiliklar',
      type: 'item',
      url: '/news-management',
      icon: FileTextOutlined,
      breadcrumbs: false
    },
    {
      id: 'students-management',
      title: 'Bizning talabalarimiz',
      type: 'item',
      url: '/students-management',
      icon: UsergroupAddOutlined,
      breadcrumbs: false
    },
    {
      id: 'laboratories-management',
      title: 'Laboratoriyalar',
      type: 'item',
      url: '/laboratories-management',
      icon: ApartmentOutlined,
      breadcrumbs: false
    },
    {
      id: 'announcements-management',
      title: 'E’lonlar',
      type: 'item',
      url: '/announcements-management',
      icon: NotificationOutlined,
      breadcrumbs: false
    },
    {
      id: 'partners-management',
      title: 'Xalqaro hamkorlarimiz',
      type: 'item',
      url: '/partners-management',
      icon: GlobalOutlined,
      breadcrumbs: false
    },
    {
      id: 'statistics-management',
      title: 'Talabalar va xodimlar hajmi',
      type: 'item',
      url: '/statistics-management',
      icon: BarChartOutlined,
      breadcrumbs: false
    }
  ]
};

export default homePageManagement;
