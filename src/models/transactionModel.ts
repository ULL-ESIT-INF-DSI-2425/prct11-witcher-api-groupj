import { Schema, model } from "mongoose";
import { TransactionDocumentInterface } from "../interfaces/transactionInterface.js";

/**
 * Esquema de transacciones en la base de datos.
 * Representa una transacción que puede ser una compra de un cazador o una venta de un mercader.
 */
const TransactionSchema = new Schema<TransactionDocumentInterface>({
  /**
   * Tipo de transacción: "purchase" (compra) o "sell" (venta).
   */
  type: {
    type: String,
    enum: ["purchase", "sell"],
    required: true,
  },
  /**
   * Referencia al cazador (cliente) en caso de que la transacción sea de tipo "purchase".
   */
  client: {
    type: Schema.Types.ObjectId,
    ref: "Hunter",
    required: function (this: TransactionDocumentInterface) {
      return this.type === "purchase";
    },
  },
  /**
   * Referencia al mercader en caso de que la transacción sea de tipo "sell".
   */
  merchant: {
    type: Schema.Types.ObjectId,
    ref: "Merchant",
    required: function () {
      return this.type === "sell";
    },
  },
  /**
   * Lista de bienes involucrados en la transacción.
   */
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
  /**
   * Fecha de la transacción.
   * Por defecto, se establece en la fecha actual.
   */
  date: {
    type: Date,
    default: Date.now,
  },
  /**
   * Valor total de la transacción.
   * Debe ser mayor o igual a 0.
   */
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
 * Middleware que se ejecuta antes de guardar una transacción.
 * Valida la existencia de cazadores, mercaderes y bienes, y calcula el valor total de la transacción.
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

/**
 * Modelo de transacciones basado en el esquema `TransactionSchema`.
 */
export const Transaction = model<TransactionDocumentInterface>(
  "Transaction",
  TransactionSchema,
);