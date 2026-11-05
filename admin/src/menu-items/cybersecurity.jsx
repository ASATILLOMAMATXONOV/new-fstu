import { ExperimentOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

export default {
  id: 'cybersecurity-group',
  title: 'Xavfsizlik',
  type: 'group',
  children: [
    {
      id: 'cybersecurity',
      title: 'Kiberxavfsizlik',
      type: 'item',
      url: '/cybersecurity',
      icon: SafetyCertificateOutlined,
      breadcrumbs: false
    },
    { id: 'honeytokens', title: 'Tuzoq kalitlar', type: 'item', url: '/honeytokens', icon: ExperimentOutlined, breadcrumbs: false }
  ]
};
