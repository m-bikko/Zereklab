import mongoose, { Document, Schema } from 'mongoose';

export interface ISaleItem {
  productId: string;
  productName: string;
  price: number;
  salePrice?: number;
  quantity: number;
  totalPrice: number;
}

export interface ISale extends Document {
  customerPhone: string;
  customerFullName?: string;
  items: ISaleItem[];
  totalAmount: number;
  bonusesEarned: number;
  bonusStatus: 'pending' | 'credited';
  bonusAvailableDate: Date;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  salePrice: {
    type: Number,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

const SaleSchema = new Schema<ISale>(
  {
    customerPhone: {
      type: String,
      required: true,
      match: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
      index: true,
    },
    customerFullName: {
      type: String,
      trim: true,
      index: true,
    },
    items: {
      type: [SaleItemSchema],
      required: true,
      validate: {
        validator: function(items: ISaleItem[]) {
          return items.length > 0;
        },
        message: 'Sale must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    bonusesEarned: {
      type: Number,
      required: true,
      min: 0,
    },
    bonusStatus: {
      type: String,
      enum: ['pending', 'credited'],
      default: 'pending',
      required: true,
    },
    bonusAvailableDate: {
      type: Date,
      index: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount and bonuses before saving
SaleSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.bonusesEarned = Math.floor(this.totalAmount * 0.03); // 3% bonus
  
  // Set bonus available date to 10 days from sale date
  const saleDate = this.saleDate || new Date();
  const availableDate = new Date(saleDate);
  availableDate.setDate(availableDate.getDate() + 10);
  this.bonusAvailableDate = availableDate;
  
  next();
});

const Sale = mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);

export default Sale;