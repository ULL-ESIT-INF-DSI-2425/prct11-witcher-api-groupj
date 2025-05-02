import express from 'express';
import './db/mongoose.js';
import { userRouter } from './routers/user.js';
import { noteRouter } from './routers/note.js';
import { defaultRouter } from './routers/default.js';

const app = express();
app.use(express.json());
app.use(userRouter);
app.use(noteRouter);
app.use(defaultRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});