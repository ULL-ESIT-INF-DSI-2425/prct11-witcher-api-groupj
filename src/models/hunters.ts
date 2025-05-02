import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

export interface HunterDocumentInterface extends Document {
  name: string;
  age: number;
  race: 'Witcher' | 'Knight' | 'Noble' | 'Bandit' | 'Villager';
  location: 'Brugge' | 'Maribor' | 'Cintra' | 'Verden';
}

const HunterSchema = new Schema<HunterDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!value.match(/^[A-Z]/)) {
        throw new Error('Hunter name must start with a capital letter');
      } else if (!validator.default.isAlphanumeric(value)) {
        throw new Error('Hunter name must contain alphanumeric characters only');
      }
    },
  },
  age: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error('Age cannot be less than 0');
      }
    },
  },
  race: {
    type: String,
    required: true,
    enum: ['witcher', 'Knight', 'Noble', 'Bandit', 'Villager'],
  },
  location: {
    type: String,
    required: true,
    enum: ['Brugge', 'Maribor', 'Cintra', 'Verden'],
  },
});

export const Hunter = model<HunterDocumentInterface>('Hunter', HunterSchema);
