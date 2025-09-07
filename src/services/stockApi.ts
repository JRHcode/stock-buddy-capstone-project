
import axios from 'axios';

const API_KEY = "dwVGc1ATt2CKGMCYr8MB6Iv4Armr0Que";
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const STABLE_URL = 'https://financialmodelingprep.com/stable';

if (!API_KEY) {
  console.warn('Financial Modeling Prep API key not found');
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  volume: number;
  marketCap: number;
  pe: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
  yearHigh: number;
  yearLow: number;
  priceAvg50: number;
  priceAvg200: number;
  eps: number;
  sharesOutstanding: number;
  exchange: string;
  avgVolume: number;
  earningsAnnouncement: string;
  timestamp: number;
  // Additional fields from company profile
  industry?: string;
  sector?: string;
  country?: string;
  city?: string;
  state?: string;
  ceo?: string;
  fullTimeEmployees?: number;
  beta?: number;
  lastDiv?: number;
  range?: string;
  dcf?: number;
  dcfDiff?: number;
  image?: string;
  hasHistoricalData?: boolean;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

// Add a simpler interface for the light endpoint
export interface LightHistoricalPrice {
  date: string;
  close: number;
  volume: number;
}

// Add these interfaces to your existing types
export interface NewsArticle {
  title: string;
  content: string;
  date: string;
  author: string;
  site: string;
  image: string;
  link: string;
  tickers: string[];
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

// List of symbols available on the free plan
export const FREE_PLAN_SYMBOLS = [
  'AAPL', 'TSLA', 'AMZN', 'MSFT', 'NVDA', 'GOOGL', 'META', 'NFLX', 'JPM', 'V', 
  'BAC', 'AMD', 'PYPL', 'DIS', 'T', 'PFE', 'COST', 'INTC', 'KO', 'TGT', 'NKE', 
  'SPY', 'BA', 'BABA', 'XOM', 'WMT', 'GE', 'CSCO', 'VZ', 'JNJ', 'CVX', 'PLTR', 
  'SQ', 'SHOP', 'SBUX', 'SOFI', 'HOOD', 'RBLX', 'SNAP', 'UBER', 'FDX', 'ABBV', 
  'ETSY', 'MRNA', 'LMT', 'GM', 'F', 'RIVN', 'LCID', 'CCL', 'DAL', 'UAL', 'AAL', 
  'TSM', 'SONY', 'ET', 'NOK', 'MRO', 'COIN', 'SIRI', 'RIOT', 'CPRX', 'VWO', 
  'SPYG', 'ROKU', 'VIAC', 'ATVI', 'BIDU', 'DOCU', 'ZM', 'PINS', 'TLRY', 'WBA', 
  'MGM', 'NIO', 'C', 'GS', 'WFC', 'ADBE', 'PEP', 'UNH', 'CARR', 'FUBO', 'HCA', 
  'TWTR', 'BILI', 'RKT'
];

class StockApiService {
  private async makeRequest<T>(url: string): Promise<T> {
    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Check if symbol is available on free plan
  isSymbolAvailableOnFreePlan(symbol: string): boolean {
    return FREE_PLAN_SYMBOLS.includes(symbol.toUpperCase());
  }

  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const upperSymbol = symbol.toUpperCase();
      
      // Check if symbol is available on free plan
      if (!FREE_PLAN_SYMBOLS.includes(upperSymbol)) {
        console.warn(`Symbol ${upperSymbol} not available on free plan`);
        return null;
      }

      const url = `${STABLE_URL}/quote?symbol=${upperSymbol}&apikey=${API_KEY}`;
      const data = await this.makeRequest<any[]>(url);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('No quote data received');
        return null;
      }

      const quote = data[0];
      
      // Transform the API response to match our StockQuote interface
      return {
        symbol: quote.symbol || upperSymbol,
        name: quote.name || `${upperSymbol} Company`,
        price: parseFloat(quote.price) || 0,
        change: parseFloat(quote.change) || 0,
        changesPercentage: parseFloat(quote.changesPercentage) || 0,
        volume: parseInt(quote.volume) || 0,
        marketCap: parseInt(quote.marketCap) || 0,
        pe: parseFloat(quote.pe) || 0,
        dayHigh: parseFloat(quote.dayHigh) || 0,
        dayLow: parseFloat(quote.dayLow) || 0,
        open: parseFloat(quote.open) || 0,
        previousClose: parseFloat(quote.previousClose) || 0,
        yearHigh: parseFloat(quote.yearHigh) || 0,
        yearLow: parseFloat(quote.yearLow) || 0,
        priceAvg50: parseFloat(quote.priceAvg50) || 0,
        priceAvg200: parseFloat(quote.priceAvg200) || 0,
        eps: parseFloat(quote.eps) || 0,
        sharesOutstanding: parseInt(quote.sharesOutstanding) || 0,
        exchange: quote.exchange || 'NASDAQ',
        avgVolume: parseInt(quote.avgVolume) || 0,
        earningsAnnouncement: quote.earningsAnnouncement || '',
        timestamp: quote.timestamp || Math.floor(Date.now() / 1000),
        // Additional fields from profile
        industry: quote.industry || 'N/A',
        sector: quote.sector || 'N/A',
        country: quote.country || 'N/A',
        city: quote.city || 'N/A',
        state: quote.state || 'N/A',
        ceo: quote.ceo || 'N/A',
        fullTimeEmployees: quote.fullTimeEmployees ? parseInt(quote.fullTimeEmployees) : 0,
        beta: quote.beta ? parseFloat(quote.beta) : 0,
        lastDiv: quote.lastDiv ? parseFloat(quote.lastDiv) : 0,
        range: quote.range || 'N/A',
        dcf: quote.dcf ? parseFloat(quote.dcf) : 0,
        dcfDiff: quote.dcfDiff ? parseFloat(quote.dcfDiff) : 0,
        image: quote.image || '',
        // Add flag for chart availability
        hasHistoricalData: this.isSymbolAvailableOnFreePlan(symbol)
      };
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      return null;
    }
  }

  // Search for stocks by query using the stable endpoint
  async searchStocks(query: string): Promise<StockSearchResult[]> {
    try {
      // For the free plan, we'll filter the available symbols
      const upperQuery = query.toUpperCase();
      const matchingSymbols = FREE_PLAN_SYMBOLS.filter(symbol => 
        symbol.includes(upperQuery)
      );

      // Return mock search results for matching symbols
      return matchingSymbols.slice(0, 10).map(symbol => ({
        symbol,
        name: `${symbol} Company`,
        currency: 'USD',
        stockExchange: 'NASDAQ',
        exchangeShortName: 'NASDAQ'
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }

  // Get historical prices using a different endpoint
  async getHistoricalPrices(symbol: string, days: number = 30): Promise<HistoricalPrice[] | null> {
    try {
      const upperSymbol = symbol.toUpperCase();
      
      // Check if symbol is available on free plan
      if (!this.isSymbolAvailableOnFreePlan(upperSymbol)) {
        console.warn(`Symbol ${upperSymbol} not available on free plan`);
        return null;
      }

      const url = `${STABLE_URL}/historical-price-eod/light?symbol=${upperSymbol}&apikey=${API_KEY}`;
      const data = await this.makeRequest<any[]>(url);
      
      console.log('Raw historical API response:', data);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('No historical data received or invalid format');
        return null;
      }

      // Transform the API response to our format
      const transformedData = data.slice(0, days).map((item, index) => {
        // Ensure we have valid numbers
        const closePrice = parseFloat(item.close) || parseFloat(item.price) || 0;
        const volume = parseInt(item.volume) || 0;
        
        console.log(`Processing item ${index}:`, { 
          date: item.date, 
          close: closePrice, 
          volume: volume,
          rawItem: item 
        });

        return {
          date: item.date || new Date().toISOString().split('T')[0],
          open: closePrice, // Using close as open since light endpoint doesn't provide open
          high: closePrice * 1.02, // Mock high as 2% above close
          low: closePrice * 0.98, // Mock low as 2% below close
          close: closePrice,
          adjClose: closePrice,
          volume: volume,
          unadjustedVolume: volume,
          change: index < data.length - 1 ? closePrice - (parseFloat(data[index + 1].close) || parseFloat(data[index + 1].price) || 0) : 0,
          changePercent: index < data.length - 1 ? 
            ((closePrice - (parseFloat(data[index + 1].close) || parseFloat(data[index + 1].price) || 0)) / 
             (parseFloat(data[index + 1].close) || parseFloat(data[index + 1].price) || 1)) * 100 : 0,
          vwap: closePrice,
          label: item.date || new Date().toISOString().split('T')[0],
          changeOverTime: 0
        };
      });

      console.log('Transformed historical data:', transformedData);
      
      // Filter out any items with invalid close prices
      const validData = transformedData.filter(item => !isNaN(item.close) && item.close > 0);
      
      console.log('Valid historical data after filtering:', validData);
      
      return validData.length > 0 ? validData : null;
      
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      return null;
    }
  }

  // Get company profile using stable endpoint
  async getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
    try {
      const upperSymbol = symbol.toUpperCase();
      
      // Check if symbol is available on free plan
      if (!FREE_PLAN_SYMBOLS.includes(upperSymbol)) {
        console.warn(`Symbol ${upperSymbol} not available on free plan`);
        return null;
      }

      const url = `${BASE_URL}/profile/${upperSymbol}?apikey=${API_KEY}`;
      const data = await this.makeRequest<CompanyProfile[]>(url);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('No company profile data received');
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return null;
    }
  }

  // Test endpoint to verify API connectivity
  async testConnection(): Promise<boolean> {
    try {
      const url = `${STABLE_URL}/quote?symbol=AAPL&apikey=${API_KEY}`;
      await this.makeRequest(url);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  // Add this method to your StockApiService class
  async getNews(page: number = 0, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const url = `${STABLE_URL}/fmp-articles?page=${page}&limit=${limit}&apikey=${API_KEY}`;
      console.log('Fetching news from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const articles = await response.json();
      
      if (articles && Array.isArray(articles)) {
        // Ensure tickers is always an array
        return articles.map(article => ({
          ...article,
          tickers: Array.isArray(article.tickers) ? article.tickers : []
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }
}

export const stockApi = new StockApiService();
