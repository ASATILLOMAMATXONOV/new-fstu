import PropTypes from 'prop-types';
import React, { createContext, useEffect, useReducer } from 'react';

import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project import
import Loader from 'components/Loader';
import {
  apiGet,
  apiPost,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearStoredAuth
} from 'utils/fetch';

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

function getStorage(usePersistentStorage = false) {
  return usePersistentStorage ? window.localStorage : window.sessionStorage;
}

function getStoredToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY) ||
    window.sessionStorage.getItem(AUTH_TOKEN_KEY) ||
    ''
  );
}

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded = jwtDecode(serviceToken);
  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const getStoredUser = () => {
  try {
    const storedUser =
      window.localStorage.getItem(AUTH_USER_KEY) ||
      window.sessionStorage.getItem(AUTH_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (_error) {
    return null;
  }
};

const buildUserFromToken = (serviceToken) => {
  try {
    const decoded = jwtDecode(serviceToken);

    return {
      id: decoded.sub || null,
      login: decoded.login || '',
      role: decoded.role || 'admin'
    };
  } catch (_error) {
    return null;
  }
};

const setSession = (serviceToken, user = null, remember = false) => {
  if (serviceToken) {
    clearStoredAuth();
    const storage = getStorage(remember);
    storage.setItem(AUTH_TOKEN_KEY, serviceToken);
    if (user) {
      storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } else {
    clearStoredAuth();
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = getStoredToken();

        if (serviceToken && verifyToken(serviceToken)) {
          const remember = Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY));
          const response = await apiGet('/api/account/me', {
            headers: {
              Authorization: `Bearer ${serviceToken}`
            }
          });
          const user = response.data?.user || getStoredUser() || buildUserFromToken(serviceToken);
          setSession(serviceToken, user, remember);
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user
            }
          });
        } else {
          setSession(null);
          dispatch({
            type: LOGOUT
          });
        }
      } catch (_error) {
        setSession(null);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (identity, password, remember = false) => {
    const response = await apiPost('/api/account/login', { identity, password });
    const { serviceToken, user } = response.data;
    setSession(serviceToken, user, remember);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });
  };

  const register = async (email, password, firstName, lastName) => {
    const response = await apiPost('/api/account/register', {
      email,
      password,
      firstName,
      lastName
    });

    if (response.data?.serviceToken && response.data?.user) {
      setSession(response.data.serviceToken, response.data.user, true);
      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user: response.data.user
        }
      });
    }
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async (email) => {
    console.log('email - ', email);
  };

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};

JWTProvider.propTypes = {
  children: PropTypes.node
};

export default JWTContext;
