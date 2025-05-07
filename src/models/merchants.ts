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
