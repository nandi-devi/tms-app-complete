import { Schema, model, Document, Types } from 'mongoose';

export interface IPromissoryNote extends Document {
  supplier: Types.ObjectId;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  paymentTerms?: string;
  isPaid: boolean;
}

const PromissoryNoteSchema = new Schema({
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  amount: { type: Number, required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  paymentTerms: { type: String },
  isPaid: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default model<IPromissoryNote>('PromissoryNote', PromissoryNoteSchema);
