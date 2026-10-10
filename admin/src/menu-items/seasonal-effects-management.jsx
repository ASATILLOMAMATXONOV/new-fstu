import { CloudOutlined } from '@ant-design/icons';

const icons = {
  CloudOutlined
};

const seasonalEffectsManagement = {
  id: 'seasonal-effects-management-group',
  title: 'Fasl animatsiyasi',
  type: 'group',
  children: [
    {
      id: 'seasonal-effects-management',
      title: 'Fasl effektlari',
      type: 'item',
      url: '/seasonal-effects-management',
      icon: icons.CloudOutlined,
      breadcrumbs: false
    }
  ]
};

export default seasonalEffectsManagement;
