import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AuthGate from './AuthGate';
import PublicSite from './PublicSite';
import './styles.css';
import './public-site.css';

const isAppPath = window.location.pathname === '/app' || window.location.pathname.startsWith('/app/');
createRoot(document.getElementById('root')).render(isAppPath ? <AuthGate><App /></AuthGate> : <PublicSite />);
