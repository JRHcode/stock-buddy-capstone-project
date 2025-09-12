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
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  lastResendAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  portfolio: IPortfolioHolding[];
  watchlist: IWatchlistItem[];
  alerts: IAlert[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAlert {
    id: string;
    symbol: string;
    condition: 'above' | 'below' | 'change';
    targetValue: number;
    currentValue?: number;
    isActive: boolean;
    createdAt: Date;
    triggeredAt?: Date;
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
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    required: false
  },
  verificationTokenExpires: {
    type: Date,
    required: false
  },
  lastResendAt: {
    type: Date,
    required: false
  },
  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpiry: {
    type: Date,
    required: false
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
      id: { type: String, required: true },
      symbol: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, default: 0 },
      change: { type: Number, required: true, default: 0 },
      changePercent: { type: Number, required: true, default: 0 },
      addedAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  alerts: {
    type: [{
      id: { type: String, required: true },
      symbol: { type: String, required: true },
      condition: { type: String, enum: ['above', 'below', 'change'], required: true },
      targetValue: { type: Number, required: true },
      currentValue: { type: Number },
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
      triggeredAt: { type: Date }
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