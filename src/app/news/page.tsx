
'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { stockApi, NewsArticle } from '@/services/stockApi';
import Button from '@/components/ui/Button';

export default function NewsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { watchlist } = useWatchlist();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [generalArticles, setGeneralArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>('all');

  const fetchNews = async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);
      
      const newArticles = await stockApi.getNews(pageNum, 20);
      
      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        // Ensure each article has proper structure
        const processedArticles = newArticles.map(article => ({
          ...article,
          tickers: Array.isArray(article.tickers) ? article.tickers : [],
          title: article.title || 'Untitled',
          content: article.content || '',
          date: article.date || new Date().toISOString(),
          author: article.author || 'Unknown',
          site: article.site || 'Financial Modeling Prep',
          image: article.image || '',
          link: article.link || '#'
        }));
        
        setArticles(prev => append ? [...prev, ...processedArticles] : processedArticles);
        setPage(pageNum);
        
        // Store first 5 articles as general market news
        if (!append && processedArticles.length > 0) {
          setGeneralArticles(processedArticles.slice(0, 5));
        }
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news articles. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Filter articles based on watchlist and selected stock
  useEffect(() => {
    if (selectedStock === 'general') {
      setFilteredArticles(generalArticles);
      return;
    }

    if (watchlist.length === 0) {
      setFilteredArticles([]);
      return;
    }

    const watchlistSymbols = watchlist.map(stock => stock.symbol.toUpperCase());
    
    let filtered = articles.filter(article => {
      if (!article.tickers || !Array.isArray(article.tickers)) return false;
      
      // Check if any of the article's tickers are in the user's watchlist
      return article.tickers.some(ticker => 
        watchlistSymbols.includes(ticker.toUpperCase())
      );
    });

    // Further filter by selected stock if not 'all'
    if (selectedStock !== 'all') {
      filtered = filtered.filter(article => 
        article.tickers && article.tickers.some(ticker => 
          ticker.toUpperCase() === selectedStock.toUpperCase()
        )
      );
    }

    setFilteredArticles(filtered);
  }, [articles, watchlist, selectedStock, generalArticles]);

  useEffect(() => {
    fetchNews(0);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && selectedStock !== 'general') {
      fetchNews(page + 1, true);
    }
  };

  const handleStockFilter = (symbol: string) => {
    setSelectedStock(symbol);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExcerpt = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary transition-colors">
              {selectedStock === 'general' ? 'Market News' : 'Watchlist News'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-dark-text-secondary transition-colors">
              {selectedStock === 'general' 
                ? 'Latest general market news and updates'
                : 'Latest news for stocks in your watchlist'
              }
            </p>
          </div>

          {/* Stock Filter Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              Filter by stock:
            </label>
            <select
              value={selectedStock}
              onChange={(e) => handleStockFilter(e.target.value)}
              className="w-full md:w-64 p-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="general">General Market News</option>
              {watchlist.length > 0 && (
                <>
                  <option value="all">All Watchlist Stocks ({watchlist.length})</option>
                  {watchlist.map((stock) => (
                    <option key={stock.id} value={stock.symbol}>
                      {stock.symbol} - {stock.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Empty Watchlist State - Only show when not viewing general news */}
          {watchlist.length === 0 && selectedStock !== 'general' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2 transition-colors">
                No stocks in watchlist
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4 transition-colors">
                Add stocks to your watchlist to see relevant news articles, or view general market news above.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.location.href = '/watchlist'}
                  variant="primary"
                >
                  Go to Watchlist
                </Button>
                <Button
                  onClick={() => setSelectedStock('general')}
                  variant="secondary"
                >
                  View General News
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-dark-text-secondary">Loading news...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  <button
                    onClick={() => fetchNews(0)}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* News Articles */}
          {!loading && filteredArticles.length > 0 && (
            <div className="space-y-6">
              {/* Results Summary */}
              <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} 
                {selectedStock === 'general' && ' from general market news'}
                {selectedStock !== 'all' && selectedStock !== 'general' && ` for ${selectedStock}`}
              </div>

              {filteredArticles.map((article, index) => (
                <article
                  key={`${article.link}-${index}`}
                  className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border overflow-hidden transition-colors hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Article Image */}
                      {article.image && (
                        <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Article Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary line-clamp-2 transition-colors">
                            {article.title}
                          </h2>
                        </div>
                        
                        {/* Article Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-dark-text-secondary mb-3 transition-colors">
                          <span>{formatDate(article.date)}</span>
                          {article.author && (
                            <>
                              <span>•</span>
                              <span>By {article.author}</span>
                            </>
                          )}
                          {article.site && (
                            <>
                              <span>•</span>
                              <span>{article.site}</span>
                            </>
                          )}
                        </div>
                        
                        {/* Article Excerpt */}
                        <p className="text-gray-700 dark:text-dark-text-secondary mb-4 transition-colors">
                          {getExcerpt(article.content)}
                        </p>
                        
                        {/* Tickers and Read More */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {article.tickers && Array.isArray(article.tickers) && article.tickers.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {article.tickers.slice(0, 3).map((ticker) => (
                                  <span
                                    key={ticker}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 transition-colors"
                                  >
                                    {ticker}
                                  </span>
                                ))}
                                {article.tickers.length > 3 && (
                                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                                    +{article.tickers.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-500 text-sm font-medium transition-colors"
                          >
                            Read full article
                            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              
              {/* Load More Button */}
              {hasMore && selectedStock !== 'general' && (
                <div className="text-center py-6">
                  <Button
                    onClick={handleLoadMore}
                    isLoading={loadingMore}
                    variant="secondary"
                  >
                    {loadingMore ? 'Loading more articles...' : 'Load More Articles'}
                  </Button>
                </div>
              )}
              
              {!hasMore && filteredArticles.length > 0 && selectedStock !== 'general' && (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-dark-text-secondary">
                    You've reached the end of the news feed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredArticles.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📰</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2 transition-colors">
                No news articles found
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary transition-colors">
                {selectedStock === 'general'
                  ? 'There are currently no general market news articles.'
                  : 'There are currently no news articles for the selected stock(s).'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
