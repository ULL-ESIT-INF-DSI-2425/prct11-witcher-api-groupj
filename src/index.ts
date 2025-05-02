// HUNTERS DUPLICADOS POR NOMBRE ARREGLAR

import express from 'express';
import './db/mongoose.js';
import { hunterRouter } from './routers/hunters.js';
import { defaultRouter } from './routers/default.js';

const app = express();
app.use(express.json());
app.use(hunterRouter);
app.use(defaultRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});