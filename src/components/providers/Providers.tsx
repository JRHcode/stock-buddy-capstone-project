'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { AlertsProvider } from '@/contexts/AlertsContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <PortfolioProvider>
            <AlertsProvider>
              {children}
            </AlertsProvider>
          </PortfolioProvider>
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}