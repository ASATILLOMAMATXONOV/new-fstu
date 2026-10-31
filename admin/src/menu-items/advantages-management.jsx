// assets
import { AppstoreOutlined } from '@ant-design/icons';

// icons
const icons = {
  AppstoreOutlined
};

// ==============================|| MENU ITEMS - ADVANTAGES MANAGEMENT ||============================== //

const advantagesManagement = {
  id: 'advantages-management-group',
  title: 'Afzalliklar boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'advantages-management',
      title: 'Afzalliklar bloki',
      type: 'item',
      url: '/advantages-management',
      icon: icons.AppstoreOutlined,
      breadcrumbs: false
    },
    {
      id: 'rankings-management',
      title: 'Reyting ko‘rsatkichlari',
      type: 'item',
      url: '/rankings-management',
      icon: icons.AppstoreOutlined,
      breadcrumbs: false
    },
    {
      id: 'academic-structure-management',
      title: 'Akademik tuzilma',
      type: 'item',
      url: '/academic-structure-management',
      icon: icons.AppstoreOutlined,
      breadcrumbs: false
    }
  ]
};

export default advantagesManagement;
