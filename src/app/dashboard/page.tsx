'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useAlerts } from '@/contexts/AlertsContext';
import Modal from '@/components/ui/Modal';
import Navigation from '@/components/layout/Navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StockSearch from '@/components/stock/StockSearch';
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import InfoTooltip from '@/components/ui/InfoTooltip';
import DropdownWatchlist from '@/components/watchlist/DropdownWatchlist';
import { getTop30MarketCap, MarketCapStock } from '@/data/top30MarketCap';
import { WeekHighStock } from '@/data/52WeekHighs';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { isLoading } = useRequireAuth();
  const { watchlist, addToWatchlist, isLoading: watchlistLoading } = useWatchlist();
  const { holdings, addHolding, getTotalValue, getTotalGainLoss, isLoading: portfolioLoading } = usePortfolio();
  const { addAlert } = useAlerts();

  // Modal states
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [showHoldingsModal, setShowHoldingsModal] = useState(false);
  const [showMarketCapHoldingsModal, setShowMarketCapHoldingsModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Form states
  const [watchlistSymbol, setWatchlistSymbol] = useState('');
  const [holdingForm, setHoldingForm] = useState({
    symbol: '',
    shares: '',
    price: ''
  });
  const [alertForm, setAlertForm] = useState({
    symbol: '',
    targetValue: '',
    condition: 'above' as 'above' | 'below' | 'change'
  });
  const [isSettingAlert, setIsSettingAlert] = useState(false);

  // Top 30 Market Cap state
  const [top30Stocks, setTop30Stocks] = useState<MarketCapStock[]>([]);
  const [isLoadingTop30, setIsLoadingTop30] = useState(true);
  const [selectedMarketCapStock, setSelectedMarketCapStock] = useState<MarketCapStock | null>(null);
  const [marketCapHoldingShares, setMarketCapHoldingShares] = useState('');

  // 52 Week Highs state
  const [weekHighStocks, setWeekHighStocks] = useState<WeekHighStock[]>([]);
  const [isLoadingWeekHighs, setIsLoadingWeekHighs] = useState(true);

  // Search state for triggering external stock searches
  const [searchSymbol, setSearchSymbol] = useState<string>('');

  // Load Top 30 Market Cap data from real API
  useEffect(() => {
    const loadTop30Data = async () => {
      try {
        setIsLoadingTop30(true);
        const response = await fetch('/api/market-data/sp30');
        const result = await response.json();
        
        if (result.success) {
          console.log('S&P 30 data received:', result.data);
          setTop30Stocks(result.data);
        } else {
          console.error('Failed to load S&P 30:', result.error);
          // Fall back to static data if API fails
          const fallbackData = await getTop30MarketCap();
          setTop30Stocks(fallbackData);
        }
      } catch (error) {
        console.error('Error loading S&P 30 data:', error);
        // Fall back to static data on error
        try {
          const fallbackData = await getTop30MarketCap();
          setTop30Stocks(fallbackData);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      } finally {
        setIsLoadingTop30(false);
      }
    };

    loadTop30Data();
  }, []);

  // Load 52 Week Highs data
  useEffect(() => {
    const load52WeekHighsData = async () => {
      try {
        setIsLoadingWeekHighs(true);
        const response = await fetch('/api/market-data/52-week-highs');
        const result = await response.json();
        
        if (result.success) {
          console.log('52 Week Highs data received:', result.data);
          setWeekHighStocks(result.data);
        } else {
          console.error('Failed to load 52-week highs:', result.error);
        }
      } catch (error) {
        console.error('Error loading 52-week highs data:', error);
      } finally {
        setIsLoadingWeekHighs(false);
      }
    };

    load52WeekHighsData();
  }, []);

  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAddToWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchlistSymbol.trim()) return;
  
    try {
      // Create mock stock data for the symbol
      //Remove the mock data and replace with actual API call
      const mockStock = {
        symbol: watchlistSymbol.toUpperCase(),
        name: `${watchlistSymbol.toUpperCase()} Company`,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5
      };
      
      await addToWatchlist(mockStock);
      setWatchlistSymbol('');
      setShowWatchlistModal(false);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add stock to watchlist. Please try again.');
    }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdingForm.symbol || !holdingForm.shares || !holdingForm.price) return;

    try {
      await addHolding({
        symbol: holdingForm.symbol.toUpperCase(),
        name: `${holdingForm.symbol.toUpperCase()} Company`,
        shares: parseFloat(holdingForm.shares),
        avgPrice: parseFloat(holdingForm.price)
      });
      
      setHoldingForm({ symbol: '', shares: '', price: '' });
      setShowHoldingsModal(false);
      
    } catch (err) {
      console.error('Error adding holding:', err);
      alert('Failed to add holding. Please try again.');
    }
  };

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.symbol || !alertForm.targetValue) return;

    setIsSettingAlert(true);

    try {
      // Use the addAlert function from your AlertsContext
      
      await addAlert({
        symbol: alertForm.symbol.toUpperCase(),
        targetValue: parseFloat(alertForm.targetValue),
        condition: alertForm.condition
      });
      
      // Show success message
      alert(`Alert set for ${alertForm.symbol.toUpperCase()} when price goes ${alertForm.condition} ${alertForm.targetValue}!`);
      
      // Reset form and close modal
      setAlertForm({ symbol: '', targetValue: '', condition: 'above' });
      setShowAlertModal(false);
      
    } catch (err: any) {
      console.error('Error setting alert:', err);
      alert(err.message || 'Failed to set alert. Please try again.');
    } finally {
      setIsSettingAlert(false);
    }
    
  };

  // Handler for adding stock to watchlist (works with any stock type)
  const handleStockAddToWatchlist = async (stock: any) => {
    try {
      const watchlistStock = {
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent
      };
      
      await addToWatchlist(watchlistStock);
      alert(`${stock.symbol} added to your watchlist!`);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add stock to watchlist. Please try again.');
    }
  };

  // Handler for adding stock to holdings (works with any stock type)
  const handleStockAddToHoldings = (stock: any) => {
    // Convert to MarketCapStock format for the modal
    const marketCapStock = {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      marketCap: stock.marketCap || 0
    };
    setSelectedMarketCapStock(marketCapStock);
    setShowMarketCapHoldingsModal(true);
  };

  // Handler for simplified holdings modal submission
  const handleMarketCapHoldingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMarketCapStock || !marketCapHoldingShares) return;

    try {
      await addHolding({
        symbol: selectedMarketCapStock.symbol,
        name: selectedMarketCapStock.name,
        shares: parseFloat(marketCapHoldingShares),
        avgPrice: selectedMarketCapStock.price // Use current price as average price
      });
      
      setMarketCapHoldingShares('');
      setSelectedMarketCapStock(null);
      setShowMarketCapHoldingsModal(false);
      alert(`${selectedMarketCapStock.symbol} added to your holdings!`);
      
    } catch (err) {
      console.error('Error adding holding:', err);
      alert('Failed to add holding. Please try again.');
    }
  };

  // Handler for symbol clicks - triggers stock search
  const handleSymbolClick = (symbol: string) => {
    console.log(`Symbol clicked: ${symbol}`);
    setSearchSymbol(symbol);
  };

  // Calculate portfolio stats
  const totalValue = getTotalValue();
  const totalGainLoss = getTotalGainLoss();
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-8 transition-colors">
            Welcome back, {user?.name}!
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats Cards */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary transition-colors">Portfolio Value</h3>
                <InfoTooltip 
                  content="Portfolio Value represents the total current market value of all your stock holdings. 
                  It's calculated by multiplying the number of shares you own by the current stock price for each holding, then summing them all together.
                  The dollar value and percentage change for today are displayed."
                  position="top"
                />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 transition-colors">{formatCurrency(totalValue)}</p>
              <p className={`text-sm transition-colors ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)} ({totalGainLossPercent.toFixed(2)}%)
              </p>
              
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary transition-colors">Watchlist</h3>
                <InfoTooltip 
                  content="A list of stocks you are tracking. You can add any stock to your watchlist to monitor its performance without owning it."
                  position="top"
                />
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors">{watchlist.length}</p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">stocks tracked</p>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary transition-colors">Holdings</h3>
                <InfoTooltip 
                  content="The investments you currently own. This section tracks the number of shares and the average price paid for each stock."
                  position="top"
                />
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-colors">{holdings.length}</p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">investments</p>
            </div>
          </div>

          {/* Stock Search Section */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 mb-8 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 transition-colors">Search Stocks</h2>
            <StockSearch onExternalSearch={searchSymbol} />
          </div>

          {/* S&P 30 Market Cap Watchlist */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-4xl">
              <DropdownWatchlist
                title="S&P 30"
                tooltip="The 30 largest companies in the S&P 500 by market cap. Click on the symbol to see the chart."
                stocks={top30Stocks}
                isLoading={isLoadingTop30}
                onAddToWatchlist={handleStockAddToWatchlist}
                onAddToHoldings={handleStockAddToHoldings}
                onSymbolClick={handleSymbolClick}
                showMarketCap={true}
              />
            </div>
          </div>

          {/* 52 Week Highs Watchlist */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-4xl">
              <DropdownWatchlist
                title="52 Week Highs"
                tooltip="Stocks within 5% of their 52-week high price, with volume ≥100,000 and current price ≥$25. These stocks are bullish."
                stocks={weekHighStocks}
                isLoading={isLoadingWeekHighs}
                onAddToWatchlist={handleStockAddToWatchlist}
                onAddToHoldings={handleStockAddToHoldings}
                onSymbolClick={handleSymbolClick}
                showMarketCap={true}
                icon="📈"
              />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 transition-colors">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                type="button"
                onClick={() => setShowWatchlistModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary transition-colors">Add to Watchlist</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-black transition-colors">Track your favorite stocks</p>
                </div>
              </button>
              
              <button 
                type="button"
                onClick={() => setShowHoldingsModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💼</div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary transition-colors">Add Holdings</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-black transition-colors">Record your investments</p>
                </div>
              </button>
              
              <button 
                type="button"
                onClick={() => setShowAlertModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔔</div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary transition-colors">Set Alert</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-black transition-colors">Get notified of price changes</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Watchlist Modal */}
      <Modal
        isOpen={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        title="Add Stock to Watchlist"
      >
        <form onSubmit={handleAddToWatchlist} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-black mb-1 transition-colors">
              Stock Symbol
            </label>
            <Input
              type="text"
              value={watchlistSymbol}
              onChange={(e) => setWatchlistSymbol(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={watchlistLoading}>
              Add to Watchlist
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Holdings Modal */}
      <Modal
        isOpen={showHoldingsModal}
        onClose={() => setShowHoldingsModal(false)}
        title="Add Holdings"
      >
        <form onSubmit={handleAddHolding} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-black mb-1 transition-colors">
              Stock Symbol
            </label>
            <Input
              type="text"
              value={holdingForm.symbol}
              onChange={(e) => setHoldingForm({ ...holdingForm, symbol: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-black mb-1 transition-colors">
              Number of Shares
            </label>
            <Input
              type="number"
              value={holdingForm.shares}
              onChange={(e) => setHoldingForm({ ...holdingForm, shares: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-black mb-1 transition-colors">
              Average Price per Share
            </label>
            <Input
              type="number"
              value={holdingForm.price}
              onChange={(e) => setHoldingForm({ ...holdingForm, price: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={portfolioLoading}>
              Add Holding
            </Button>
          </div>
        </form>
      </Modal>

      {/* Set Alert Modal */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Set Price Alert"
      >
        <form onSubmit={handleSetAlert} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-black mb-1 transition-colors">
              Stock Symbol
            </label>
            <Input
              type="text"
              value={alertForm.symbol}
              onChange={(e) => setAlertForm({ ...alertForm, symbol: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-black mb-1 transition-colors">
              Target Price
            </label>
            <Input
              type="number"
              value={alertForm.targetValue}
              onChange={(e) => setAlertForm({ ...alertForm, targetValue: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-black mb-1 transition-colors">
              Alert Condition
            </label>
            <select
              value={alertForm.condition}
              onChange={(e) => setAlertForm({ ...alertForm, condition: e.target.value as 'above' | 'below' | 'change' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text-primary transition-colors"
            >
              <option value="above">Price goes above</option>
              <option value="below">Price goes below</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSettingAlert}>
              Set Alert
            </Button>
          </div>
        </form>
      </Modal>

      {/* Market Cap Holdings Modal - Simplified */}
      <Modal
        isOpen={showMarketCapHoldingsModal}
        onClose={() => {
          setShowMarketCapHoldingsModal(false);
          setSelectedMarketCapStock(null);
          setMarketCapHoldingShares('');
        }}
        title={`Add ${selectedMarketCapStock?.symbol} to Holdings`}
      >
        {selectedMarketCapStock && (
          <div className="space-y-4">
            {/* Stock Info Display */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-dark-text-primary">
                    {selectedMarketCapStock.symbol}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                    {selectedMarketCapStock.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-gray-900 dark:text-dark-text-primary">
                    {formatCurrency(selectedMarketCapStock.price)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Current Price
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleMarketCapHoldingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-black mb-1 transition-colors">
                  Number of Shares
                </label>
                <Input
                  type="number"
                  value={marketCapHoldingShares}
                  onChange={(e) => setMarketCapHoldingShares(e.target.value)}
                  placeholder="Enter number of shares"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-black mt-1">
                  Average price will be set to current market price: {formatCurrency(selectedMarketCapStock.price)}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowMarketCapHoldingsModal(false);
                    setSelectedMarketCapStock(null);
                    setMarketCapHoldingShares('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={portfolioLoading}>
                  Add to Holdings
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}