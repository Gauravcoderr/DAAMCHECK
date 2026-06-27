import mongoose, { Document, Schema } from 'mongoose';

export interface IChatLead extends Document {
  name: string;
  email: string;
  query?: string;
  createdAt: Date;
}

const ChatLeadSchema = new Schema<IChatLead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    query: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IChatLead>('ChatLead', ChatLeadSchema);
