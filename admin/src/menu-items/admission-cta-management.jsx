import { FileTextOutlined } from '@ant-design/icons';

const icons = {
  FileTextOutlined
};

const admissionCtaManagement = {
  id: 'admission-cta-management-group',
  title: 'Bosh sahifa bloki',
  type: 'group',
  children: [
    {
      id: 'admission-cta-management',
      title: 'Qabul 2024',
      type: 'item',
      url: '/admission-cta-management',
      icon: icons.FileTextOutlined,
      breadcrumbs: false
    }
  ]
};

export default admissionCtaManagement;
