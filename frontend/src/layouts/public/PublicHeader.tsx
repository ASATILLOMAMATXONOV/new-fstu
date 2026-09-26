import {
  ChevronDown,
  CircleArrowRight,
  Menu,
  X,
} from 'lucide-react';

import {
  Link,
  NavLink,
  useLocation,
} from 'react-router-dom';

import {
  useEffect,
  useState,
} from 'react';

import { PublicTopbar } from './PublicTopbar';

import { MAIN_NAVIGATION } from '@/shared/constants/navigation';

import './styles/header.css';

export function PublicHeader() {
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleMenuToggle = () => {
    setMenuOpen((current) => !current);
  };

  return (
    <>
      <PublicTopbar />

      <header className="site-header">
        <div className="container header-inner">
          <Link
            to="/"
            className="header-logo"
            aria-label="Bosh sahifa"
          >
            <img
              src="/images/logo.png"
              alt="Farg‘ona davlat texnika universiteti"
            />
          </Link>

          <nav
            id="main-navigation"
            className={[
              'main-navigation',
              menuOpen && 'open',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label="Asosiy navigatsiya"
          >
            {MAIN_NAVIGATION.map((item) => {
              if (item.children?.length) {
                return (
                  <div
                    key={item.label}
                    className="nav-dropdown"
                  >
                    <button
                      type="button"
                      className="nav-dropdown-trigger"
                    >
                      <span>{item.label}</span>

                      <ChevronDown
                        size={15}
                        className="dropdown-icon"
                        aria-hidden="true"
                      />
                    </button>

                    <div className="nav-dropdown-menu">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            [
                              'dropdown-item',
                              isActive && 'active',
                            ]
                              .filter(Boolean)
                              .join(' ')
                          }
                        >
                          <span className="dropdown-item-icon">
                            <CircleArrowRight
                              size={18}
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />
                          </span>

                          <span className="dropdown-item-label">
                            {child.label}
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    isActive ? 'active' : undefined
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={handleMenuToggle}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={
              menuOpen
                ? 'Menyuni yopish'
                : 'Menyuni ochish'
            }
          >
            {menuOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
          </button>
        </div>
      </header>
    </>
  );
}