import { Document } from 'mongoose';

/**
 * Interfaz que representa un documento de un bien de nuestra posada.
 */
export interface GoodDocumentInterface extends Document {
  name: string;
  description?: string;
  material: 'Iron' | 'Steel' | 'Silver' | 'Leather' | 'Herbs';
  weight: number;
  value: number;
  quantity: number;
}