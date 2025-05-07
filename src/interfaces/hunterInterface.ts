import { Document } from "mongoose";

/**
 * Interfaz que representa un documento de un cazador de nuestra posada.
 */
export interface HunterDocumentInterface extends Document {
  name: string;
  age: number;
  race: 'Witcher' | 'Knight' | 'Noble' | 'Bandit' | 'Villager';
  location: 'Brugge' | 'Maribor' | 'Cintra' | 'Verden';
}