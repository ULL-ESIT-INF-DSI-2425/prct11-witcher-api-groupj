import { Schema, model } from 'mongoose';
import { GoodDocumentInterface } from "../interfaces/goodInterface.js";
import validator from 'validator';

const GoodSchema = new Schema<GoodDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!value.match(/^[A-Z]/)) {
        throw new Error('Good name must start with a capital letter');
      } else if (!validator.default.isAlphanumeric(value.replace(/\s/g, ''))) {
        throw new Error('Good name must be alphanumeric');
      }
    },
  },
  description: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  material: {
    type: String,
    required: true,
    enum: ['Iron' , 'Steel' , 'Silver' , 'Leather' , 'Herbs'],
  },
  weight: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value <= 0) {
        throw new Error('Weight must be greater than 0');
      }
    },
  },
  value: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value <= 0) {
        throw new Error('Value must be greater than 0');
      }
    },
  },
  // ponerle que si no dice quantity, sea default 10 o algo asi yoqse xddd
  quantity: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
    },
  },
});

export const Good = model<GoodDocumentInterface>('Good', GoodSchema);
