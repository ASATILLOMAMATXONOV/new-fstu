// assets
import { UsergroupAddOutlined } from '@ant-design/icons';

// icons
const icons = {
  UsergroupAddOutlined
};

// ==============================|| MENU ITEMS - STUDENTS MANAGEMENT ||============================== //

const studentsManagement = {
  id: 'students-management-group',
  title: 'Talabalar boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'students-management',
      title: 'Bizning talabalarimiz',
      type: 'item',
      url: '/students-management',
      icon: icons.UsergroupAddOutlined,
      breadcrumbs: false
    }
  ]
};

export default studentsManagement;