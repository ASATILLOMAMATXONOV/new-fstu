// assets
import { ApartmentOutlined } from '@ant-design/icons';

// icons
const icons = {
  ApartmentOutlined
};

// ==============================|| MENU ITEMS - FACULTIES MANAGEMENT ||============================== //

const facultiesManagement = {
  id: 'faculties-management-group',
  title: 'Fakultet va kafedralar',
  type: 'group',
  children: [
    {
      id: 'faculties-management',
      title: 'Fakultet / kafedra',
      type: 'item',
      url: '/faculties-management',
      icon: icons.ApartmentOutlined,
      breadcrumbs: false
    }
  ]
};

export default facultiesManagement;