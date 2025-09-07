
'use client';

import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 transition-colors">
              About Stock Buddy
            </h1>
            <p className="text-xl text-gray-600 dark:text-dark-text-secondary max-w-2xl mx-auto transition-colors">
              Your trusted companion for tracking investments and staying informed about the stock market
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-8 mb-8 border dark:border-dark-border transition-colors">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 transition-colors">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed transition-colors">
              Stock Buddy was created to democratize access to financial information and make investment tracking 
              simple and accessible for everyone. Whether you're a seasoned investor or just starting your 
              financial journey, our platform provides the tools and insights you need to make informed decisions 
              about your investments.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-6 border dark:border-dark-border transition-colors">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-3 transition-colors">
                Real-time Market Data
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary transition-colors">
                Access up-to-date stock prices, market trends, and financial data to stay informed about your investments.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-6 border dark:border-dark-border transition-colors">
              <div className="text-3xl mb-4">💼</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-3 transition-colors">
                Portfolio Management
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary transition-colors">
                Track your investments, monitor performance, and gain insights into your portfolio's health.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-6 border dark:border-dark-border transition-colors">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-3 transition-colors">
                Investment Insights
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary transition-colors">
                Get personalized analysis to help you navigate the financial markets.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-6 border dark:border-dark-border transition-colors">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-3 transition-colors">
                Secure & Reliable
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary transition-colors">
                Your financial data is protected with security and privacy controls.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 transition-colors">
              Ready to get started?
            </h2>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6 transition-colors">
              Join the Stock Buddy community and embark on your financial journey.
            </p>
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
