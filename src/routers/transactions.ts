import express from 'express';
import { Transaction } from '../models/transactions.js';
import { Hunter } from '../models/hunters.js';
import { Merchant } from '../models/merchants.js';
import { Good } from '../models/goods.js';

export const transactionsRouter = express.Router();

transactionsRouter.get('/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      res.status(400).send({ error: 'Transaction not found' });
    }

    res.status(200).send(transaction);
  } catch (error) {
    res.status(500).send(error);
  }
});

transactionsRouter.post('/transactions', async (req, res) => {
  try {
    const { hunterName, merchantName, goods } = req.body;

    // Validar que se proporcione al menos un cazador o un mercader
    if (!hunterName && !merchantName) {
      res.status(400).send({ error: 'Debe especificar un cazador o un mercader' });
    }

    // Buscar el cazador o mercader en la base de datos
    const hunter = hunterName ? await Hunter.findOne({ name: hunterName }) : null;
    const merchant = merchantName ? await Merchant.findOne({ name: merchantName }) : null;

    if (hunterName && !hunter) {
      res.status(404).send({ error: 'Cazador no encontrado' });
    }

    if (merchantName && !merchant) {
      res.status(404).send({ error: 'Mercader no encontrado' });
    }

    // Validar y procesar los bienes
    const { processedGoods, totalAmount } = await processGoods(goods, hunter);

    // Crear la nueva transacción
    const newTransaction = new Transaction({
      type: hunter ? 'purchase' : 'sell',
      client: hunter ? hunter._id : null,
      merchant: merchant ? merchant._id : null,
      goods: processedGoods,
      date: new Date(),
      totalValue: totalAmount,
    });

    await newTransaction.save();
    res.status(201).send(newTransaction);
  } catch (error) {
    console.error('Error al crear la transacción:', error);
    res.status(500).send( error );
  }
});

/**
 * Procesa los bienes de la transacción.
 * @param goods - Lista de bienes con nombre y cantidad.
 * @param hunter - Instancia del cazador (si aplica).
 * @returns Bienes procesados y el importe total.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processGoods(goods: { name: string; quantity: number }[], hunter: any) {
  let totalAmount = 0;
  const processedGoods = [];

  for (const item of goods) {
    const { name, quantity } = item;

    const good = await Good.findOne({ name });
    if (!good) {
      throw new Error(`Bien no encontrado: ${name}`);
    }

    if (hunter && good.quantity < quantity) {
      throw new Error(`Stock insuficiente para el bien: ${name}`);
    }

    // Actualizar el stock si es una compra de un cazador
    if (hunter) {
      good.quantity -= quantity;
      await good.save();
    }

    // Calcular el importe total
    totalAmount += good.value * quantity;

    processedGoods.push({ good: good._id, quantity });
  }

  return { processedGoods, totalAmount };
}

