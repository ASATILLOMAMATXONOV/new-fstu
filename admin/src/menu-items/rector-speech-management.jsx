import { MessageOutlined } from '@ant-design/icons';

const icons = {
  MessageOutlined
};

const rectorSpeechManagement = {
  id: 'rector-speech-management-group',
  title: 'Rektor sahifasi',
  type: 'group',
  children: [
    {
      id: 'rector-speech-management',
      title: 'Rektor murojaati',
      type: 'item',
      url: '/rector-speech-management',
      icon: icons.MessageOutlined,
      breadcrumbs: false
    }
  ]
};

export default rectorSpeechManagement;