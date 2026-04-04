'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/lib/store';
import { authApi, setAccessToken } from '@/lib/api';
import { SettingsProvider } from '@/lib/settings-context';
import { I18nProvider } from '@/lib/i18n';

interface ProvidersProps {
  children: ReactNode;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      setLoading(true);
      try {
        // First try: restore access token from localStorage (helps on mobile)
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('tapix_at') : null;
        if (storedToken) {
          setAccessToken(storedToken);
          try {
            const user = await authApi.getMe();
            setUser(user);
            setLoading(false);
            return; // Success with stored token
          } catch {
            // Stored token expired, try refresh
          }
        }

        // Second try: refresh via cookie
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        const user = await authApi.getMe();
        setUser(user);
      } catch (error) {
        // Not authenticated, that's fine
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
      <SettingsProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              className: 'toast-custom',
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </SettingsProvider>
      </I18nProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default Providers;
