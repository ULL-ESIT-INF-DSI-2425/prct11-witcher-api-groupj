import { Schema, model } from 'mongoose';
import { MerchantDocumentInterface } from "../interfaces/merchantInterface.js";
import validator from 'validator';

const MerchantSchema = new Schema<MerchantDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!value.match(/^[A-Z]/)) {
        throw new Error('Merchant name must start with a capital letter');
      } else if (!validator.default.isAlphanumeric(value)) {
        throw new Error('Menchant name must contain alphanumeric characters only');
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
      if (!Number.isInteger(value)) {
      throw new Error('Age must be an integer');
      }
    },
  },
  location: {
    type: String,
    required: true,
    enum: ['Brugge', 'Maribor', 'Cintra', 'Verden'],
  },
  type: {
    type: String,
    required: true,
    enum: ['blacksmith', 'alchemist', 'trader', 'herbalist'],
  },
});

export const Merchant = model<MerchantDocumentInterface>('Merchant', MerchantSchema);
