import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  purchaseDate: string;
}

export interface IWatchlistItem {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  addedAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  portfolio: IPortfolioHolding[];
  watchlist: IWatchlistItem[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}



const userSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  portfolio: {
    type: [{
      id: { type: String, required: true },
      symbol: { type: String, required: true },
      name: { type: String, required: true },
      shares: { type: Number, required: true },
      avgPrice: { type: Number, required: true },
      purchaseDate: { type: String, required: true }
    }],
    default: [] 
  },
  watchlist: {
    type: [{
      symbol: { type: String, required: true },
      name: { type: String, required: true },
      lastPrice: { type: Number, required: true, default: 0 },
      change: { type: Number, required: true, default: 0 },
      changePercent: { type: Number, required: true, default: 0 },
      addedAt: { type: Date, default: Date.now }
    }],
    default: []
  }
}, {
  timestamps: true
});

// Fix: Add proper typing for this context in methods
interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserDocument = IUser & UserMethods;

// Pre-save hook
userSchema.pre('save', async function(this: UserDocument, next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});


userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;