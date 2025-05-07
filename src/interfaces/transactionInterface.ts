import { Document, Types } from "mongoose";
import { GoodDocumentInterface } from "../interfaces/goodInterface.js";
import { HunterDocumentInterface } from "../interfaces/hunterInterface.js";
import { MerchantDocumentInterface } from "../interfaces/merchantInterface.js";

/**
 * Interfaz que define la estructura de un documento de transacción en la base de datos.
 */
export interface TransactionDocumentInterface extends Document {
  type: "purchase" | "sell";
  client: Types.ObjectId | HunterDocumentInterface | null;
  merchant: Types.ObjectId | MerchantDocumentInterface | null;
  goods: {
    good: Types.ObjectId | GoodDocumentInterface;
    quantity: number;
  }[];
  date: Date;
  totalValue: number;
}