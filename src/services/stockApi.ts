
import axios from 'axios';

const API_KEY = "dwVGc1ATt2CKGMCYr8MB6Iv4Armr0Que"; // Hardcoded for testing
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const STABLE_URL = 'https://financialmodelingprep.com/stable';

if (!API_KEY) {
  console.warn('FMP API key not found. Please add NEXT_PUBLIC_FMP_API_KEY to your .env.local file');
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
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
  hasHistoricalData?: boolean; // Add this line
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
  symbol: string;
  date: string;
  price: number;
  volume: number;
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
      console.log('Making request to:', url); // Debug log
      const response = await axios.get(url);
      console.log('Response status:', response.status); // Debug log
      return response.data;
    } catch (error) {
      console.error('Stock API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Request URL:', error.config?.url);
      }
      throw new Error(`Failed to fetch stock data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if symbol is available on free plan
  isSymbolAvailableOnFreePlan(symbol: string): boolean {
    return FREE_PLAN_SYMBOLS.includes(symbol.toUpperCase());
  }

  // Search for stocks by query using the stable endpoint
  async searchStocks(query: string): Promise<StockSearchResult[]> {
    if (!query || query.length < 1) return [];
    
    const url = `${STABLE_URL}/search-symbol?query=${encodeURIComponent(query)}&apikey=${API_KEY}`;
    const results = await this.makeRequest<StockSearchResult[]>(url);
    return results || [];
  }

  // Get basic stock info using only the profile endpoint (which works with free tier)
  async getStockQuote(symbol: string): Promise<any> {
    try {
      // Use the company profile endpoint which we know works
      const profileUrl = `${STABLE_URL}/profile?symbol=${symbol.toUpperCase()}&apikey=${API_KEY}`;
      const profile = await this.makeRequest<any>(profileUrl);
      
      // The profile endpoint returns an array, so we take the first item
      if (profile && Array.isArray(profile) && profile.length > 0) {
        const stockData = profile[0];
        
        return {
          symbol: symbol.toUpperCase(),
          name: stockData.companyName || stockData.name || symbol,
          price: stockData.price || 0,
          change: stockData.changes || 0,
          changesPercentage: stockData.changesPercentage || 0,
          marketCap: stockData.mktCap || stockData.marketCap || 0,
          volume: stockData.volAvg || stockData.volume || 0,
          exchange: stockData.exchangeShortName || stockData.exchange || 'N/A',
          industry: stockData.industry || 'N/A',
          sector: stockData.sector || 'N/A',
          website: stockData.website || '',
          description: stockData.description || '',
          // Additional fields from profile
          country: stockData.country || 'N/A',
          fullTimeEmployees: stockData.fullTimeEmployees || 0,
          city: stockData.city || 'N/A',
          state: stockData.state || 'N/A',
          ceo: stockData.ceo || 'N/A',
          beta: stockData.beta || 0,
          lastDiv: stockData.lastDiv || 0,
          range: stockData.range || 'N/A',
          dcf: stockData.dcf || 0,
          dcfDiff: stockData.dcfDiff || 0,
          image: stockData.image || '',
          // Add flag for chart availability
          hasHistoricalData: this.isSymbolAvailableOnFreePlan(symbol)
        };
      }
      
      // If profile fails or returns empty, return basic data
      return {
        symbol: symbol.toUpperCase(),
        name: symbol,
        price: 0,
        change: 0,
        changesPercentage: 0,
        marketCap: 0,
        volume: 0,
        exchange: 'N/A',
        industry: 'N/A',
        sector: 'N/A',
        website: '',
        description: 'No data available',
        hasHistoricalData: this.isSymbolAvailableOnFreePlan(symbol)
      };
      
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error; // Re-throw to handle in component
    }
  }

  // Get company profile using stable endpoint
  async getCompanyProfile(symbol: string) {
    try {
      const url = `${STABLE_URL}/profile?symbol=${symbol.toUpperCase()}&apikey=${API_KEY}`;
      const profile = await this.makeRequest<any>(url);
      return profile;
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      return null;
    }
  }

  // Get historical prices using a different endpoint
  async getHistoricalPrices(symbol: string): Promise<HistoricalPrice[] | null> {
    try {
      const upperSymbol = symbol.toUpperCase();
      
      // Check if symbol is available on free plan
      if (!this.isSymbolAvailableOnFreePlan(upperSymbol)) {
        throw new Error(`Historical data for ${upperSymbol} is not available on the free plan. Available symbols: ${FREE_PLAN_SYMBOLS.join(', ')}`);
      }

      // Use the light historical endpoint which we know works
      const url = `${STABLE_URL}/historical-price-eod/light?symbol=${upperSymbol}&apikey=${API_KEY}`;
      console.log('Fetching historical data from:', url);
      
      const data = await this.makeRequest<LightHistoricalPrice[]>(url);
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('Historical data fetched successfully, data length:', data.length);
        
        // Transform the light endpoint data to match our HistoricalPrice interface
        const transformedData: HistoricalPrice[] = data.map(item => ({
          date: item.date,
          open: item.price,
          high: item.price,
          low: item.price,
          close: item.price,
          adjClose: item.price,
          volume: item.volume || 0,
          unadjustedVolume: item.volume || 0,
          change: 0,
          changePercent: 0,
          vwap: item.price,
          label: item.date,
          changeOverTime: 0
        }));
        
        // Sort by date (newest first)
        return transformedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      
      console.log('No data returned from historical endpoint');
      return null;
      
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw error;
    }
  }

  // Test endpoint to verify API connectivity
  async testConnection(): Promise<boolean> {
    try {
      const url = `${STABLE_URL}/search-symbol?query=AAPL&apikey=${API_KEY}`;
      await this.makeRequest(url);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

export const stockApi = new StockApiService();
