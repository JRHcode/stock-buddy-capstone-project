'use client';

import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

export default function Navigation() {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="bg-white dark:bg-dark-surface shadow-sm dark:shadow-lg border-b dark:border-dark-border transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors">
              📈 Stock Buddy
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-bg/50"
            >
              Dashboard
            </Link>
            
            <Link
              href="/portfolio"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-bg/50"
            >
              Portfolio
            </Link>
            <Link
              href="/watchlist"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-bg/50"
            >
              Watchlist
            </Link>
            <Link
              href="/alerts"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-bg/50"
            >
              Alerts
            </Link>
            <Link
              href="/news"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-bg/50"
            >
              News
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-bg/50"
            >
              About
            </Link>
          </div>

          {/* Right side - Theme toggle, Profile, Logout */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg/50 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {/* Profile Link */}
            <Link
              href="/profile"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 dark:text-dark-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-bg/50"
            >
              {user?.name || 'Profile'}
            </Link>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="secondary"
              size="sm"
              className="text-gray-700 dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400"
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}