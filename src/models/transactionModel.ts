import { Document, Schema, model, Types } from "mongoose";
import { GoodDocumentInterface } from "../interfaces/goodInterface.js";
import { HunterDocumentInterface } from "../interfaces/hunterInterface.js";
import { MerchantDocumentInterface } from "../interfaces/merchantInterface.js";

// falta por hacer rollos con el refund, y corregir más rollos

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
// haz validators
const TransactionSchema = new Schema<TransactionDocumentInterface>({
  type: {
    type: String,
    enum: ["purchase", "sell"],
    required: true,
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: "Hunter",
    required: function (this: TransactionDocumentInterface) {
      return this.type === "purchase";
    },
  },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: "Merchant",
    required: function () {
      return this.type === "sell";
    },
  },
  goods: [
    {
      good: {
        type: Schema.Types.ObjectId,
        ref: "Good",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  totalValue: {
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => value >= 0,
      message: "The total value must be greater or equal than 0.",
    },
  },
});

/**
 * esto hace tal cual pollas
 */
TransactionSchema.pre("save", async function (next) {
  try {
    // Validar existencia del Hunter si el tipo es "purchase"
    if (this.type === "purchase") {
      const hunterExists = await model("Hunter").exists({ _id: this.client });
      if (!hunterExists) {
        throw new Error(`Hunter with ID ${this.client} does not exist.`);
      }
    }

    // Validar existencia del Merchant si el tipo es "sell"
    if (this.type === "sell") {
      const merchantExists = await model("Merchant").exists({ _id: this.merchant });
      if (!merchantExists) {
        throw new Error(`Merchant with ID ${this.merchant} does not exist.`);
      }
    }

    // Validar existencia de los bienes y calcular el totalValue
    let total = 0;
    for (const item of this.goods) {
      const good = await model("Good").findById(item.good);
      if (!good) {
        throw new Error(`Good with ID ${item.good} doesn't exist.`);
      }
      total += good.price * item.quantity;
    }
    this.totalValue = total;

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Transaction = model<TransactionDocumentInterface>(
  "Transaction",
  TransactionSchema,
);