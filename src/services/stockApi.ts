
// Client-side API service that calls our Next.js API routes

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


class StockApiService {
  private async makeRequest<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const upperSymbol = symbol.toUpperCase();
      console.log(`Client: Fetching stock quote for: ${upperSymbol}`);
      
      const quote = await this.makeRequest<StockQuote>(`/api/stocks/quote?symbol=${encodeURIComponent(upperSymbol)}`);
      
      console.log('Client: Stock quote received');
      return quote;
    } catch (error) {
      console.error('Client: Error fetching stock quote:', error);
      return null;
    }
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    try {
      console.log(`Client: Searching for stocks with query: ${query}`);
      
      const results = await this.makeRequest<StockSearchResult[]>(`/api/stocks/search?q=${encodeURIComponent(query)}`);
      
      console.log(`Client: Found ${results.length} search results`);
      return results;
    } catch (error) {
      console.error('Client: Error searching stocks:', error);
      return [];
    }
  }

  async getHistoricalPrices(symbol: string, days: number = 30): Promise<HistoricalPrice[] | null> {
    try {
      const upperSymbol = symbol.toUpperCase();
      console.log(`Client: Fetching historical data for: ${upperSymbol} (${days} days)`);
      
      const data = await this.makeRequest<HistoricalPrice[] | null>(`/api/stocks/historical?symbol=${encodeURIComponent(upperSymbol)}&days=${days}`);
      
      console.log(`Client: Historical data received`);
      return data;
    } catch (error) {
      console.error('Client: Error fetching historical prices:', error);
      return null;
    }
  }

  // Get company profile - for now we'll use the quote endpoint since it has some profile data
  async getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
    try {
      const upperSymbol = symbol.toUpperCase();
      console.log(`Client: Fetching company profile for: ${upperSymbol}`);
      
      // For now, we'll create a basic profile from the quote data
      const quote = await this.getStockQuote(upperSymbol);
      
      if (!quote) {
        return null;
      }

      return {
        symbol: upperSymbol,
        companyName: quote.name,
        currency: 'USD',
        cik: '',
        isin: '',
        cusip: '',
        exchange: quote.exchange,
        exchangeShortName: quote.exchange,
        industry: quote.industry || '',
        website: '',
        description: '',
        ceo: quote.ceo || '',
        sector: quote.sector || '',
        country: quote.country || '',
        fullTimeEmployees: quote.fullTimeEmployees?.toString() || '0',
        phone: '',
        address: '',
        city: quote.city || '',
        state: quote.state || '',
        zip: '',
        dcfDiff: 0,
        dcf: 0,
        image: '',
        ipoDate: '',
        defaultImage: false,
        isEtf: false,
        isActivelyTrading: true,
        isAdr: false,
        isFund: false
      };
    } catch (error) {
      console.error('Client: Error fetching company profile:', error);
      return null;
    }
  }

  // Test API connectivity by trying to fetch a quote
  async testConnection(): Promise<boolean> {
    try {
      console.log('Client: Testing API connection...');
      const quote = await this.getStockQuote('AAPL');
      const success = quote !== null;
      console.log(`Client: API connection test ${success ? 'successful' : 'failed'}`);
      return success;
    } catch (error) {
      console.error('Client: API connection test failed:', error);
      return false;
    }
  }

  // Note: News functionality not implemented yet
  async getNews(page: number = 0, limit: number = 20): Promise<NewsArticle[]> {
    console.warn('Client: News functionality not yet implemented');
    return [];
  }
}

export const stockApi = new StockApiService();
