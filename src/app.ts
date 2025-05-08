// readme: link del render
// hacer video

import express from 'express';
import './db/mongoose.js';
import { hunterRouter } from './routers/hunterRouter.js';
import { goodsRouter } from './routers/goodRouter.js';
import { merchantsRouter } from './routers/merchantRouter.js';
import { defaultRouter } from './routers/defaultRouter.js';
import { transactionsRouter } from './routers/transactionRouter.js';

export const app = express();
app.use(express.json());
app.use(hunterRouter);
app.use(goodsRouter);
app.use(merchantsRouter);
app.use(transactionsRouter);
app.use(defaultRouter);
