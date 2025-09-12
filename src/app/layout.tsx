import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { AlertsProvider } from '@/contexts/AlertsContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stock Buddy',
  description: 'Track your favorite stocks and manage your portfolio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
      </body>
    </html>
  );
}