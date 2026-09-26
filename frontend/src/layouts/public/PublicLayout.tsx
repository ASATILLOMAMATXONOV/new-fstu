import { Outlet } from 'react-router-dom';

import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export function PublicLayout() {
  return (
    <div className="site-layout">
      <PublicHeader />

      <main className="site-main">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}