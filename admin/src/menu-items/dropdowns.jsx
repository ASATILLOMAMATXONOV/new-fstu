// assets
import { MenuOutlined } from '@ant-design/icons';

// icons
const icons = {
  MenuOutlined
};

// ==============================|| MENU ITEMS - DROPDOWNS ||============================== //

const menuManagement = {
  id: 'menu-management-group',
  title: 'Akademik menyu',
  type: 'group',
  children: [
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
