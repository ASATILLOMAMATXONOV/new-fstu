// assets
import { IdcardOutlined } from '@ant-design/icons';

// icons
const icons = {
  IdcardOutlined
};

// ==============================|| MENU ITEMS - EMPLOYEES PORTFOLIO MANAGEMENT ||============================== //

const employeesPortfolioManagement = {
  id: 'employees-portfolio-management-group',
  title: 'Hodimlar boshqaruvi',
  type: 'group',
  children: [
    {
      id: 'leadership-management',
      title: 'Ma’muriyat',
      type: 'item',
      url: '/leadership-management',
      icon: icons.IdcardOutlined,
      breadcrumbs: false
    },
    {
      id: 'employees-portfolio-management',
      title: 'Hodimlar portfolio',
      type: 'item',
      url: '/employees-portfolio-management',
      icon: icons.IdcardOutlined,
      breadcrumbs: false
    }
  ]
};

export default employeesPortfolioManagement;
