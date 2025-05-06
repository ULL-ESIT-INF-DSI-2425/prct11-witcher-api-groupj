import express from 'express';
import { Transaction } from '../models/transactions.js';
import { Hunter } from '../models/hunters.js';
import { Merchant } from '../models/merchants.js';
import { Good } from '../models/goods.js';

export const transactionsRouter = express.Router();

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
      throw new Error(`Good not found: ${name}`);
    }

    if (hunter && good.quantity < quantity) {
      throw new Error(`Insufficient stock for the good: ${name}`);
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

transactionsRouter.get('/transactions', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      res.status(400).send({ error: 'You must put a name in the query string' });
    }

    // Buscar transacciones relacionadas con un cazador o mercader por nombre
    const hunter = name ? await Hunter.findOne({ name: name.toString() }) : null;
    const merchant = name ? await Merchant.findOne({ name: name.toString() }) : null;

    if (!hunter && !merchant) {
      res.status(404).send({ error: 'No hunter or merchant found with that name' });
    }

    const transactions = await Transaction.find({
      $or: [
        { client: hunter ? hunter._id : null },
        { merchant: merchant ? merchant._id : null },
      ],
    })
      .populate('client') // Poblamos los datos del cazador
      .populate('merchant') // Poblamos los datos del mercader
      .populate('goods.good'); // Poblamos los datos de los bienes

    if (transactions.length === 0) {
      res.status(404).send({ error: 'Transactions for this name not found.' });
    }

    res.status(200).send(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).send(error);
  }
});

transactionsRouter.post('/transactions', async (req, res) => {
  try {
    const { hunterName, merchantName, goods } = req.body;

    // Validar que se proporcione al menos un cazador o un mercader
    if (!hunterName && !merchantName) {
      res.status(400).send({ error: 'You must specify a hunter or a merchant.' });
    }

    // Buscar el cazador o mercader en la base de datos
    const hunter = hunterName ? await Hunter.findOne({ name: hunterName }) : null;
    const merchant = merchantName ? await Merchant.findOne({ name: merchantName }) : null;

    if (hunterName && !hunter) {
      res.status(404).send({ error: 'Hunter not found.' });
    }

    if (merchantName && !merchant) {
      res.status(404).send({ error: 'Merchant not found.' });
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

transactionsRouter.delete('/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;

    // Buscar la transacción en la base de datos
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      res.status(404).send({ error: 'Transaction not found.' });
    }

    if (transaction && transaction.type === 'purchase') {
      for (const item of transaction.goods) {
        const good = await Good.findById(item.good);
        if (good) {
          good.quantity += item.quantity; // Revertir el stock
          await good.save();
        }
      }
    }
    if (transaction && transaction.type === 'sell') {
      for (const item of transaction.goods) {
        const good = await Good.findById(item.good);
        if (good) {
          good.quantity -= item.quantity; // Revertir el stock
          if (good.quantity < 0) good.quantity = 0;
          await good.save();
        }
      }
    }

    // Eliminar la transacción
    if (transaction) {
      await transaction.deleteOne();
    }
    res.status(200).send({ message: 'Transacction deleted successfully' });
  } catch (error) {
    console.error('Error al eliminar la transacción:', error);
    res.status(500).send({ error: 'Error interno del servidor' });
  }
});