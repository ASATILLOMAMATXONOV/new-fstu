// assets
import { BarChartOutlined } from '@ant-design/icons';

// icons
const icons = {
  BarChartOutlined
};

// ==============================|| MENU ITEMS - STATISTICS MANAGEMENT ||============================== //

const statisticsManagement = {
  id: 'statistics-management-group',
  title: 'Statistika boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'statistics-management',
      title: 'Talabalar va xodimlar hajmi',
      type: 'item',
      url: '/statistics-management',
      icon: icons.BarChartOutlined,
      breadcrumbs: false
    }
  ]
};

export default statisticsManagement;