
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IWatchlistItem {
  symbol: string;
  name: string;
  addedAt: Date;
  // Add any other stock data you're storing
  lastPrice?: number;
  change?: number;
  changePercent?: number;
}

export interface IWatchlist extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  stocks: IWatchlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const watchlistItemSchema = new Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  lastPrice: {
    type: Number,
    required: true,
    default: 0
  },
  change: {
    type: Number,
    required: true,
    default: 0
  },
  changePercent: {
    type: Number,
    required: true,
    default: 0
  }
});

const watchlistSchema: Schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One watchlist per user
  },
  stocks: [watchlistItemSchema]
}, {
  timestamps: true
});

// Index for faster queries
watchlistSchema.index({ userId: 1 });

export const Watchlist: Model<IWatchlist> = mongoose.models.Watchlist || mongoose.model<IWatchlist>('Watchlist', watchlistSchema);
export default Watchlist;