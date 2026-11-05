import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { fetchContentList } from './api/cms';

// Hero banners are the LCP element: claim the request index.html already started.
if (window.location.pathname === '/') {
  fetchContentList('banners', {}).catch(() => {});
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);