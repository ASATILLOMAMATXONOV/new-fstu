import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project import
import { canAccessAdminPath, getFirstAccessiblePath } from 'constants/admin-access';
import useAuth from 'hooks/useAuth';

// ==============================|| AUTH GUARD ||============================== //

export default function AuthGuard({ children }) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          from: location.pathname
        },
        replace: true
      });
      return;
    }

    if (user && !canAccessAdminPath(user, location.pathname)) {
      const fallbackPath = getFirstAccessiblePath(user);
      navigate(fallbackPath || '/login', { replace: true });
    }
  }, [isLoggedIn, location, navigate, user]);

  return children;
}

AuthGuard.propTypes = { children: PropTypes.any };
