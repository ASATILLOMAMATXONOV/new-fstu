// assets
import { GlobalOutlined } from '@ant-design/icons';

// icons
const icons = {
  GlobalOutlined
};

// ==============================|| MENU ITEMS - PARTNERS MANAGEMENT ||============================== //

const partnersManagement = {
  id: 'partners-management-group',
  title: 'Hamkorlar boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'partners-management',
      title: 'Xalqaro hamkorlarimiz',
      type: 'item',
      url: '/partners-management',
      icon: icons.GlobalOutlined,
      breadcrumbs: false
    }
  ]
};

export default partnersManagement;