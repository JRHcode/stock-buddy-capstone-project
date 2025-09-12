
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  volume: number;
  exchange: string;
  previousClose: number;
}

export interface Watchlist {
  id: string;
  name: string;
  stocks: string[]; // Array of stock symbols
  userId: string;
  createdAt: Date;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  addedAt: Date;
  watchlistId: string;
}
