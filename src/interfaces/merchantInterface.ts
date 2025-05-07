import { Document } from 'mongoose';

/**
 * Interfaz que representa un documento de un mercader de nuestra posada.
 */
export interface MerchantDocumentInterface extends Document {
  name: string;
  age: number;
  location: 'Brugge' | 'Maribor' | 'Cintra' | 'Verden';
  type: 'blacksmith' | 'alchemist' | 'trader' | 'herbalist';
}