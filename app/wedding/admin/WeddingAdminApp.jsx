'use client';

import './wedding-admin.css';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getAccessToken, logout } from '@/app/services/wedding/authService';

import AdminLogin from './components/AdminLogin';
import AdminShell from './components/AdminShell';
import GuestsPage from './components/GuestsPage';
import WeddingDetailsPage from './components/WeddingDetailsPage';

function pageFromPath(path) {
  return path === '/wedding-admin/details' ? 'details' : 'guests';
}

export default function WeddingAdminApp() {
  const [authState, setAuthState] = useState('checking');
  const path = usePathname();
  const router = useRouter();

  const changePath = useCallback(
    (nextPath, replace = false) => {
      router[replace ? 'replace' : 'push'](nextPath);
    },
    [router],
  );

  useEffect(() => {
    document.title = 'Wedding Admin | Zuber & Bisma';
    document.documentElement.classList.add('wedding-admin-active');
    getAccessToken().then(token => {
      if (token) {
        setAuthState('authenticated');
        if (window.location.pathname === '/wedding-admin/login')
          changePath('/wedding-admin', true);
      } else {
        setAuthState('anonymous');
        if (window.location.pathname !== '/wedding-admin/login')
          changePath('/wedding-admin/login', true);
      }
    });
    return () => {
      document.documentElement.classList.remove('wedding-admin-active');
    };
  }, [changePath]);

  const sessionExpired = useCallback(() => {
    logout();
    setAuthState('anonymous');
    changePath('/wedding-admin/login', true);
  }, [changePath]);

  const signedIn = () => {
    setAuthState('authenticated');
    changePath('/wedding-admin', true);
  };

  if (authState === 'checking')
    return <div className="admin-loading">Checking admin session...</div>;
  if (authState === 'anonymous' || path === '/wedding-admin/login')
    return <AdminLogin onSignedIn={signedIn} />;

  const page = pageFromPath(path);
  const navigate = nextPage =>
    changePath(
      nextPage === 'details' ? '/wedding-admin/details' : '/wedding-admin',
    );

  return (
    <AdminShell page={page} onNavigate={navigate} onLogout={sessionExpired}>
      {page === 'details' ? (
        <WeddingDetailsPage onSessionExpired={sessionExpired} />
      ) : (
        <GuestsPage onSessionExpired={sessionExpired} />
      )}
    </AdminShell>
  );
}
