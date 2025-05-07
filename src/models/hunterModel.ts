import { Schema, model } from 'mongoose';
import { HunterDocumentInterface } from "../interfaces/hunterInterface.js";
import validator from 'validator';

/**
 * Schema que representa un cazador en nuestra posada
 * - name: nombre del cazador
 * - age: edad del cazador
 * - race: raza del cazador, su tipo
 * - location: localizacion del cazador
 */
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
      if (!Number.isInteger(value)) {
      throw new Error('Age must be an integer');
      }
    },
  },
  race: {
    type: String,
    required: true,
    enum: ['Witcher', 'Knight', 'Noble', 'Bandit', 'Villager'],
  },
  location: {
    type: String,
    required: true,
    enum: ['Brugge', 'Maribor', 'Cintra', 'Verden'],
  },
});

export const Hunter = model<HunterDocumentInterface>('Hunter', HunterSchema);
