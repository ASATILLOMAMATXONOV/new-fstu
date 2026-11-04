import { BookOutlined } from '@ant-design/icons';

const publishingManagement = {
  id: 'publishing-management-group',
  title: 'Nashriyot',
  type: 'group',
  children: [
    {
      id: 'publishing-management',
      title: 'Nashrlar',
      type: 'item',
      url: '/publishing-management',
      icon: BookOutlined,
      breadcrumbs: false
    }
  ]
};

export default publishingManagement;
