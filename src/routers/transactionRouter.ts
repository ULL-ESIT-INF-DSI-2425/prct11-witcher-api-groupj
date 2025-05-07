import express from 'express';
import { Types } from 'mongoose';
import { Transaction } from '../models/transactionModel.js';
import { Hunter } from '../models/hunterModel.js';
import { HunterDocumentInterface } from "../interfaces/hunterInterface.js";
import { Merchant } from '../models/merchantModel.js';
import { Good } from '../models/goodModel.js';

export const transactionsRouter = express.Router();

/**
 * Procesa los bienes involucrados en una transacción.
 * 
 * @param goods - Lista de bienes con nombre y cantidad.
 * @param hunter - Instancia del cazador (si aplica).
 * @returns Un objeto con los bienes procesados y el importe total.
 * @throws Error si un bien no existe o si no hay suficiente stock.
 */
async function processGoods(
  goods: { name: string; quantity: number }[],
  hunter: HunterDocumentInterface | null
): Promise<{
  processedGoods: { good: Types.ObjectId; quantity: number }[];
  totalAmount: number;
}> {
  let totalAmount = 0;
  const processedGoods: { good: Types.ObjectId; quantity: number }[] = [];

  for (const item of goods) {
    const { name, quantity } = item;
    const good = await Good.findOne({ name });
    if (!good) {
      throw new Error(`Good not found: ${name}`);
    }
    if (hunter && good.quantity < quantity) {
      throw new Error(`Insufficient stock for the good: ${name}`);
    }
    if (hunter) {
      good.quantity -= quantity;
      await good.save();
    }
    totalAmount += good.value * quantity;
    processedGoods.push({ good: good._id as Types.ObjectId, quantity });
  }
  return { processedGoods, totalAmount };
}

/**
 * Crea una nueva transacción.
 * 
 * @route POST /transactions
 * @param req - Solicitud HTTP con hunterName, merchantName y goods en el cuerpo.
 * @param res - Respuesta HTTP.
 */
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

/**
 * Busca transacciones por nombre de cazador o mercader.
 * 
 * @route GET /transactions/by-name
 * @param req - Solicitud HTTP con el parámetro `name` en la query string.
 * @param res - Respuesta HTTP.
 */
transactionsRouter.get('/transactions/by-name', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      res.status(400).send({ error: 'You must provide a name in the query string.' });
      return;
    }

    const hunter = await Hunter.findOne({ name: name.toString() });
    const merchant = await Merchant.findOne({ name: name.toString() });

    if (!hunter && !merchant) {
      res.status(404).send({ error: 'No hunter or merchant found with that name.' });
      return;
    }

    const transactions = await Transaction.find({
      $or: [
        { client: hunter ? hunter._id : null },
        { merchant: merchant ? merchant._id : null },
      ],
    })
      .populate('client')
      .populate('merchant')
      .populate('goods.good');

    if (transactions.length === 0) {
      res.status(404).send({ error: 'No transactions found for that name.' });
    }

    res.status(200).send(transactions);
  } catch (error) {
    console.error('Error fetching transactions by name:', error);
    res.status(500).send({ error: 'Internal server error.' });
  }
});

/**
 * Busca transacciones por rango de fechas y tipo.
 * 
 * @route GET /transactions/by-date
 * @param req - Solicitud HTTP con `start`, `end` y `type` en la query string.
 * @param res - Respuesta HTTP.
 */
transactionsRouter.get('/transactions/by-date', async (req, res) => {
  try {
    const { start, end, type } = req.query;

    if (!start || !end) {
      res.status(400).send({ error: 'You must provide start and end dates in the query string.' });
      return;
    }

    const validTypes = ['purchase', 'sell', 'all'];
    if (type && !validTypes.includes(type.toString())) {
      res.status(400).send({ error: 'Transaction type must be "purchase", "sell", or "all".' });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      date: {
        $gte: new Date(start.toString()),
        $lte: new Date(end.toString()),
      },
    };

    if (type && type !== 'all') {
      filter.type = type.toString();
    }

    const transactions = await Transaction.find(filter)
      .populate('client')
      .populate('merchant')
      .populate('goods.good');

    if (transactions.length === 0) {
      res.status(404).send({ error: 'No transactions found for the specified criteria.' });
    }

    res.status(200).send(transactions);
  } catch (error) {
    console.error('Error fetching transactions by date:', error);
    res.status(500).send({ error: 'Internal server error.' });
  }
});

/**
 * Obtiene una transacción por su ID.
 * 
 * @route GET /transactions/:id
 * @param req - Solicitud HTTP con el parámetro dinámico `id`.
 * @param res - Respuesta HTTP.
 */
transactionsRouter.get('/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      res.status(404).send({ error: 'Transaction not found' });
    }

    res.status(200).send(transaction);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Actualiza parcialmente una transacción.
 * 
 * @route PATCH /transactions/:id
 * @param req - Solicitud HTTP con el parámetro dinámico `id` y datos a actualizar en el cuerpo.
 * @param res - Respuesta HTTP.
 */
transactionsRouter.patch('/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { hunterName, merchantName, goods } = req.body;

    // Buscar la transacción existente
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      res.status(404).send({ error: 'Transaction not found.' });
      return;
    }

    // Revertir el stock de los bienes de la transacción anterior
    if (transaction.type === 'purchase') {
      for (const item of transaction.goods) {
        const good = await Good.findById(item.good);
        if (good) {
          good.quantity += item.quantity; // Revertir el stock
          await good.save();
        }
      }
    } else if (transaction.type === 'sell') {
      for (const item of transaction.goods) {
        const good = await Good.findById(item.good);
        if (good) {
          good.quantity -= item.quantity; // Revertir el stock
          if (good.quantity < 0) good.quantity = 0;
          await good.save();
        }
      }
    }

    // Actualizar los datos de la transacción si se proporcionan
    if (hunterName || merchantName) {
      const hunter = hunterName ? await Hunter.findOne({ name: hunterName }) : null;
      const merchant = merchantName ? await Merchant.findOne({ name: merchantName }) : null;

      if (hunterName && !hunter) {
        res.status(404).send({ error: 'Hunter not found.' });
        return;
      }

      if (merchantName && !merchant) {
        res.status(404).send({ error: 'Merchant not found.' });
        return;
      }

      transaction.type = hunter ? 'purchase' : 'sell';
      transaction.client = hunter ? (hunter._id as Types.ObjectId) : null;
      transaction.merchant = merchant ? (merchant._id as Types.ObjectId) : null;
    }

    // Procesar y actualizar los bienes si se proporcionan
    if (goods) {
      const populatedTransaction = await transaction.populate('client');
      const { processedGoods, totalAmount } = await processGoods(goods, populatedTransaction.client as HunterDocumentInterface | null);
      transaction.goods = processedGoods;
      transaction.totalValue = totalAmount; // Actualizar el totalValue
    }

    // Actualizar la fecha de la transacción
    transaction.date = new Date();

    // Guardar la transacción actualizada
    await transaction.save();

    res.status(200).send(transaction);
  } catch (error) {
    console.error('Error al actualizar parcialmente la transacción:', error);
    res.status(500).send({ error: 'Error interno del servidor' });
  }
});

/**
 * Elimina una transacción por su ID.
 * 
 * @route DELETE /transactions/:id
 * @param req - Solicitud HTTP con el parámetro dinámico `id`.
 * @param res - Respuesta HTTP.
 */
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
    res.status(200).send({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error al eliminar la transacción:', error);
    res.status(500).send({ error: 'Error interno del servidor' });
  }
});