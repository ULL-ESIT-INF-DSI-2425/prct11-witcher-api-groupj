import { connect } from 'mongoose';

/**
 * Inicializacion de la base de datos
 */
try {
  await connect('mongodb://127.0.0.1:27017/PosadaLoboBlanco');
  console.log('Connection to MongoDB server established');
} catch (error) {
  console.log(error);
}