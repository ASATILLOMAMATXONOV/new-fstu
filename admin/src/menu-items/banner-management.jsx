// assets
import { FileImageOutlined } from '@ant-design/icons';

// icons
const icons = {
  FileImageOutlined
};

// ==============================|| MENU ITEMS - BANNER MANAGEMENT ||============================== //

const bannerManagement = {
  id: 'banner-management-group',
  title: 'Banner boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'banner-management',
      title: 'Banner qo‘yish',
      type: 'item',
      url: '/banner-management',
      icon: icons.FileImageOutlined,
      breadcrumbs: false
    }
  ]
};

export default bannerManagement;