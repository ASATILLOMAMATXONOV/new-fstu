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
    }
  ]
};

export default advantagesManagement;