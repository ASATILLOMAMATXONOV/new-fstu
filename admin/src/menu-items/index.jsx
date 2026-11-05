// project import
import other from './other';
import pages from './pages';
import homePageManagement from './home-page-management';
import menuManagement from './dropdowns';
import newPageManagement from './new-page-management';
import employeesPortfolioManagement from './employees-portfolio-management';
import facultiesManagement from './faculties-management';
import directionsManagement from './directions-management';
import facultyPageMenuManagement from './faculty-page-menu-management';
import adminUsersManagement from './admin-users-management';
import admissionCtaManagement from './admission-cta-management';
import seasonalEffectsManagement from './seasonal-effects-management';
import publishingManagement from './publishing-management';
import cybersecurity from './cybersecurity';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    homePageManagement,
    menuManagement,
    admissionCtaManagement,
    seasonalEffectsManagement,
    newPageManagement,
    publishingManagement,
    facultiesManagement,
    directionsManagement,
    facultyPageMenuManagement,
    employeesPortfolioManagement,
    adminUsersManagement,
    pages,
    other,
    cybersecurity
  ]
};

export default menuItems;
