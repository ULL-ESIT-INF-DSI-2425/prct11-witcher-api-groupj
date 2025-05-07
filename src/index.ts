// HUNTERS DUPLICADOS POR NOMBRE ARREGLAR
// poner las putas s en los manejadores
// anadir par de validadores en los modelos
// poner bien las rutas para la documentacion

import express from 'express';
import './db/mongoose.js';
import { hunterRouter } from './routers/hunters.js';
import { goodsRouter } from './routers/goods.js';
import { merchantsRouter } from './routers/merchants.js';
import { defaultRouter } from './routers/default.js';
import { transactionsRouter } from './routers/transactions.js';

const app = express();
app.use(express.json());
app.use(hunterRouter);
app.use(goodsRouter);
app.use(merchantsRouter);
app.use(transactionsRouter);
app.use(defaultRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});