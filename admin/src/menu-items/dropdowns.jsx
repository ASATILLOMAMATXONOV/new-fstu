// assets
import { MenuOutlined } from '@ant-design/icons';

// icons
const icons = {
  MenuOutlined
};

// ==============================|| MENU ITEMS - DROPDOWNS ||============================== //

const menuManagement = {
  id: 'menu-management-group',
  title: 'Sayt boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'menu-management',
      title: 'Menyular',
      type: 'item',
      url: '/menu-management',
      icon: icons.MenuOutlined,
      breadcrumbs: false
    },
    {
      id: 'academic-menu-management',
      title: 'Akademik menyu',
      type: 'item',
      url: '/academic-menu-management',
      icon: icons.MenuOutlined,
      breadcrumbs: false
    }
  ]
};

export default menuManagement;
