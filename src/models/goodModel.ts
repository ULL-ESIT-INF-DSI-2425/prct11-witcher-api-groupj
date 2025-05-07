import { Schema, model } from 'mongoose';
import { GoodDocumentInterface } from "../interfaces/goodInterface.js";
import validator from 'validator';

/**
 * Schema que representa un bien en nuestra posada
 * - name: nombre del bien 
 * - description: descripcion del bien 
 * - material: material del bien 
 * - weight: peso del bien 
 * - value: valor del bien 
 * - quantity: cantidad en stock del bien (por defecto 20)
 */
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
  quantity: {
    type: Number,
    required: true,
    default: 20,
    validate: (value: number) => {
      if (value <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      if (!Number.isInteger(value)) {
        throw new Error('Age must be an integer');
      }
    },
  },
});

export const Good = model<GoodDocumentInterface>('Good', GoodSchema);
