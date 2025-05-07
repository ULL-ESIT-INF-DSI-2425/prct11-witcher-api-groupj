import express from 'express';

/**
 * Router por defecto para rutas no definidas
 */
export const defaultRouter = express.Router();

/**
 * Rutas no implementadas de peticiones HTTP, genera un 501
 */
defaultRouter.all('/{*splat}', (_, res) => {
  res.status(501).send();
});