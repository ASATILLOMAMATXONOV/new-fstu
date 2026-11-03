// assets
import { GlobalOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';

// icons
const icons = {
  MenuOutlined,
  GlobalOutlined,
  UserOutlined
};

// ==============================|| MENU ITEMS - DROPDOWNS ||============================== //

const menuManagement = {
  id: 'menu-management-group',
  title: 'Sayt menyulari',
  type: 'group',
  children: [
    {
      id: 'international-department',
      title: 'Xalqaro bo‘lim',
      type: 'collapse',
      icon: icons.GlobalOutlined,
      children: [
        {
          id: 'international-department-leader',
          permissionKey: 'international-department-management',
          title: 'Rahbar ma’lumotlari',
          type: 'item',
          url: '/international-department-management?section=leader',
          icon: icons.UserOutlined,
          breadcrumbs: false
        },
        {
          id: 'international-department-menus',
          permissionKey: 'international-department-management',
          title: 'Bo‘lim menyulari',
          type: 'item',
          url: '/international-department-management?section=menus',
          icon: icons.MenuOutlined,
          breadcrumbs: false
        },
        {
          id: 'international-universities-management',
          permissionKey: 'international-universities-management',
          title: 'Global ta’lim hamkorlari',
          type: 'item',
          url: '/international-universities-management',
          icon: icons.GlobalOutlined,
          breadcrumbs: false
        }
      ]
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
