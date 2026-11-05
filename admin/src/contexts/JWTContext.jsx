import PropTypes from 'prop-types';
import React, { createContext, useEffect, useReducer } from 'react';
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';
import Loader from 'components/Loader';
import { apiGet, apiPost, AUTH_USER_KEY, AUTH_CSRF_KEY, clearStoredAuth } from 'utils/fetch';

const initialState = { isLoggedIn: false, isInitialized: false, user: null };
const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const applySession = (data) => {
    if (!data?.user || typeof data.csrfToken !== 'string') throw new Error('Kirish tasdiqlanmadi. Qayta urinib ko‘ring.');
    clearStoredAuth();
    window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    window.sessionStorage.setItem(AUTH_CSRF_KEY, data.csrfToken);
    dispatch({ type: LOGIN, payload: { isLoggedIn: true, user: data.user } });
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      // The HttpOnly session is checked by the server. Legacy browser tokens are ignored.
      try {
        const response = await apiGet('/api/account/me', { redirectOnUnauthorized: false });
        if (!cancelled) applySession(response.data);
      } catch {
        if (!cancelled) { clearStoredAuth(); dispatch({ type: LOGOUT }); }
      }
    };
    void init();
    return () => { cancelled = true; };
    // Initialization runs once; subsequent login responses update the same reducer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (identity, password) => {
    const response = await apiPost('/api/account/login', { identity, password });
    if (response.data?.user) applySession(response.data);
    return response.data;
  };
  const advanceLogin = async (action, payload) => {
    if (!['password', 'verify', 'confirm'].includes(action)) throw new Error('Noto‘g‘ri kirish bosqichi.');
    const response = await apiPost('/api/account/login/' + action, payload);
    if (response.data?.user) applySession(response.data);
    return response.data;
  };
  const endSession = async (all = false) => {
    try { await apiPost(all ? '/api/account/logout-all' : '/api/account/logout', {}, { redirectOnUnauthorized: false }); }
    catch (error) { if (error.status !== 401) throw error; }
    clearStoredAuth();
    dispatch({ type: LOGOUT });
  };
  const register = async () => { throw new Error('Admin hisobini faqat super admin yaratadi.'); };
  const resetPassword = async () => { throw new Error('Parolni tiklash uchun super adminga murojaat qiling.'); };
  const updateProfile = () => {};

  if (!state.isInitialized) return <Loader />;
  return <JWTContext.Provider value={{ ...state, login, advanceLogin, logout: () => endSession(false),
    logoutAll: () => endSession(true), register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};
JWTProvider.propTypes = { children: PropTypes.node };
export default JWTContext;
