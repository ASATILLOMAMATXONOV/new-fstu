const rawPartners = [
  {
    badge: 'YS',
    primary: 'YONSEI',
    secondary: 'UNIVERSITY',
    accent: '#1d3f79',
    href: 'https://www.yonsei.ac.kr/'
  },
  {
    badge: 'HY',
    primary: 'HANYANG',
    secondary: 'UNIVERSITY',
    accent: '#1558b2',
    href: 'https://www.hanyang.ac.kr/en/web/eng'
  },
  {
    badge: 'AJ',
    primary: 'AJOU',
    secondary: 'UNIVERSITY',
    accent: '#9c8a37',
    href: 'https://www.ajou.ac.kr/en/'
  },
  {
    badge: 'KN',
    primary: 'KNU',
    secondary: 'KANGWON NATIONAL',
    accent: '#2558c8',
    href: 'https://global.kangwon.ac.kr/english/index.do'
  },
  {
    badge: 'SG',
    primary: 'SOGANG',
    secondary: 'UNIVERSITY',
    accent: '#b31d2d',
    href: 'https://www.sogang.ac.kr/'
  },
  {
    badge: 'CN',
    primary: 'CHUNGNAM',
    secondary: 'NATIONAL UNIVERSITY',
    accent: '#6a7c9f',
    href: 'https://www.cnu.ac.kr/'
  }
];

function createPartnerLogo({ badge, primary, secondary, accent }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="260" height="86" viewBox="0 0 260 86" fill="none">
      <rect width="260" height="86" rx="16" fill="white"/>
      <rect x="1" y="1" width="258" height="84" rx="15" fill="url(#bg)"/>
      <circle cx="42" cy="43" r="20" fill="${accent}" fill-opacity="0.12"/>
      <circle cx="42" cy="43" r="19" stroke="${accent}" stroke-opacity="0.26" stroke-width="2"/>
      <text x="42" y="47" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="${accent}">${badge}</text>
      <text x="74" y="37" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="${accent}">${primary}</text>
      <text x="74" y="57" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#7182A3">${secondary}</text>
      <defs>
        <linearGradient id="bg" x1="130" y1="0" x2="130" y2="86" gradientUnits="userSpaceOnUse">
          <stop stop-color="white"/>
          <stop offset="1" stop-color="#F7FAFF"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const partners = rawPartners.map((item) => ({
  ...item,
  logo: createPartnerLogo(item)
}));
