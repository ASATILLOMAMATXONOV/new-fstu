import { MenuOutlined } from '@ant-design/icons';

const icons = {
  MenuOutlined
};

const facultyPageMenuManagement = {
  id: 'faculty-page-menu-management-group',
  title: 'Fakultet sahifalari',
  type: 'group',
  children: [
    {
      id: 'faculty-page-menu-management',
      title: 'O‘ng menu sozlash',
      type: 'item',
      url: '/faculty-page-menu-management',
      icon: icons.MenuOutlined,
      breadcrumbs: false
    }
  ]
};

export default facultyPageMenuManagement;