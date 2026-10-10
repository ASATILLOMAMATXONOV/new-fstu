// assets
import { NotificationOutlined } from '@ant-design/icons';

// icons
const icons = {
  NotificationOutlined
};

// ==============================|| MENU ITEMS - ANNOUNCEMENTS MANAGEMENT ||============================== //

const announcementsManagement = {
  id: 'announcements-management-group',
  title: 'E’lonlar boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'announcements-management',
      title: 'E’lonlar',
      type: 'item',
      url: '/announcements-management',
      icon: icons.NotificationOutlined,
      breadcrumbs: false
    }
  ]
};

export default announcementsManagement;