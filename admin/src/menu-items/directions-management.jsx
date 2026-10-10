import { AppstoreOutlined } from '@ant-design/icons';

const icons = {
  AppstoreOutlined
};

const directionsManagement = {
  id: 'directions-management-group',
  title: "Yo'nalishlar",
  type: 'group',
  children: [
    {
      id: 'directions-management',
      title: "Yo'nalishlar",
      type: 'item',
      url: '/directions-management',
      icon: icons.AppstoreOutlined,
      breadcrumbs: false
    }
  ]
};

export default directionsManagement;
