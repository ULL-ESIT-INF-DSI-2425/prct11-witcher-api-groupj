import { Document, Schema, model } from 'mongoose';

export interface HunterDocumentInterface extends Document {
  name: string;
  age: number;
  race: 'witcher' | 'knight' | 'noble' | 'bandit' | 'villager';
  location: string;
}

const HunterSchema = new Schema<HunterDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!value.match(/^[A-Z]/)) {
        throw new Error('Hunter name must start with a capital letter');
      }
    },
  },
  age: {
    type: Number,
    required: true,
    min: 12,
    max: 120,
  },
  race: {
    type: String,
    required: true,
    enum: ['witcher', 'knight', 'noble', 'bandit', 'villager'],
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
});

export const Hunter = model<HunterDocumentInterface>('Hunter', HunterSchema);
