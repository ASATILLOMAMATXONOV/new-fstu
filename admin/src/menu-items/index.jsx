// project import
import other from './other';
import pages from './pages';
import menuManagement from './dropdowns';
import bannerManagement from './banner-management';
import advantagesManagement from './advantages-management';
import newsManagement from './news-management';
import announcementsManagement from './announcements-management';
import studentsManagement from './students-management';
import partnersManagement from './partners-management';
import statisticsManagement from './statistics-management';
import newPageManagement from './new-page-management';
import employeesPortfolioManagement from './employees-portfolio-management';
import facultiesManagement from './faculties-management';
import directionsManagement from './directions-management';
import facultyPageMenuManagement from './faculty-page-menu-management';
import rectorSpeechManagement from './rector-speech-management';
import adminUsersManagement from './admin-users-management';
import admissionCtaManagement from './admission-cta-management';
import seasonalEffectsManagement from './seasonal-effects-management';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [menuManagement, bannerManagement, advantagesManagement,   admissionCtaManagement, seasonalEffectsManagement, rectorSpeechManagement, newsManagement, announcementsManagement, studentsManagement, partnersManagement, statisticsManagement, newPageManagement, facultiesManagement, directionsManagement, facultyPageMenuManagement, employeesPortfolioManagement, adminUsersManagement, pages, other]
};

export default menuItems;
