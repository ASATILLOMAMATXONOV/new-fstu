// assets
import { FileTextOutlined } from '@ant-design/icons';

// icons
const icons = {
  FileTextOutlined
};

// ==============================|| MENU ITEMS - NEWS MANAGEMENT ||============================== //

const newsManagement = {
  id: 'news-management-group',
  title: 'Yangiliklar boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'news-management',
      title: 'Yangiliklar',
      type: 'item',
      url: '/news-management',
      icon: icons.FileTextOutlined,
      breadcrumbs: false
    }
  ]
};

export default newsManagement;