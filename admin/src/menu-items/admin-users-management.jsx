import { TeamOutlined } from '@ant-design/icons';

const icons = {
  TeamOutlined
};

const adminUsersManagement = {
  id: 'admin-users-management-group',
  title: 'Adminlar',
  type: 'group',
  children: [
    {
      id: 'admin-users-management',
      title: 'Admin qo‘shish',
      type: 'item',
      url: '/admin-users-management',
      icon: icons.TeamOutlined,
      breadcrumbs: false
    }
  ]
};

export default adminUsersManagement;