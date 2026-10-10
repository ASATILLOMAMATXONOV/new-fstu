// assets
import { FileAddOutlined } from '@ant-design/icons';

// icons
const icons = {
  FileAddOutlined
};

// ==============================|| MENU ITEMS - NEW PAGE MANAGEMENT ||============================== //

const newPageManagement = {
  id: 'new-page-management-group',
  title: 'Sahifalar boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'new-page-management',
      title: 'New Page',
      type: 'item',
      url: '/new-page-management',
      icon: icons.FileAddOutlined,
      breadcrumbs: false
    }
  ]
};

export default newPageManagement;