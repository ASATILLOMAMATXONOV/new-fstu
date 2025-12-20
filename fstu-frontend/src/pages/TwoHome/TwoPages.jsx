import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoBanner from "../../pages/TwoHome/TwoBanner";
import TwoAbout from "../../pages/TwoHome/TwoAbout";
import TwoAboutTo from "../../pages/TwoHome/TwoAboutTo";
import TwoNews from "../../pages/TwoHome/TwoNews";
import TwoEvent from "../../pages/TwoHome/TwoEvent";
import TwoSponsors from "../../pages/TwoHome/TwoSponsors";
import TwoFooter from "../../pages/TwoHome/TwoFooter";

import ColorModeProvider from "../../components/theme/ColorModeContext";

export default function AlternativeHome() {
  return (
    <ColorModeProvider>
      <TwoNavbar />
      <TwoBanner />
      <TwoAbout />
      <TwoAboutTo />
      <TwoNews />
      <TwoEvent />
      <TwoSponsors />
      <TwoFooter />
    </ColorModeProvider>
  );
}
