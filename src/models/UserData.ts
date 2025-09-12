// Create this as a new file: src/models/UserData.ts
// Keep your existing User.ts exactly as it is - don't touch it!

import mongoose, { Document, Schema } from 'mongoose';

// Watchlist stock interface
interface IWatchlistStock {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  addedAt: Date;
}

// Portfolio holding interface
interface IPortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  purchaseDate: Date;
}

// UserData interface
export interface IUserData extends Document {
  userId: mongoose.Types.ObjectId;
  watchlist: IWatchlistStock[];
  portfolio: IPortfolioHolding[];
  createdAt: Date;
  updatedAt: Date;
}

// Watchlist stock schema
const WatchlistStockSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  lastPrice: {
    type: Number,
    default: 0
  },
  change: {
    type: Number,
    default: 0
  },
  changePercent: {
    type: Number,
    default: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Portfolio holding schema
const PortfolioHoldingSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  shares: {
    type: Number,
    required: true
  },
  avgPrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
});

// UserData schema
const UserDataSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  watchlist: {
    type: [WatchlistStockSchema],
    default: []
  },
  portfolio: {
    type: [PortfolioHoldingSchema],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.models.UserData || 
mongoose.model<IUserData>('UserData', UserDataSchema);