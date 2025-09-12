import { Schema, model, Document } from 'mongoose';

export interface INumberingConfig extends Document {
  _id: string; // sequence key, e.g., 'invoiceId', 'lorryReceiptId'
  start: number;
  end: number;
  next: number; // next number to assign
  allowOutsideRange?: boolean; // if true, fallback to legacy counter when exhausted
}

const NumberingConfigSchema = new Schema({
  _id: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  next: { type: Number, required: true },
  allowOutsideRange: { type: Boolean, default: false },
});

export default model<INumberingConfig>('NumberingConfig', NumberingConfigSchema);


