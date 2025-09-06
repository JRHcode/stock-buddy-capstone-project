import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { PortfolioProvider } from '@/contexts/PortfolioContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stock Buddy',
  description: 'Your personal stock tracking companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WatchlistProvider>
            <PortfolioProvider>
              {children}
            </PortfolioProvider>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}