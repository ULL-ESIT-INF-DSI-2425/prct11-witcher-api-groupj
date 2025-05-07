import express from "express";
import { Merchant } from "../models/merchantModel.js";

export const merchantsRouter = express.Router();

/**
 * Crea un nuevo mercader en la base de datos.
 * @route POST /merchants
 * @body { name, age, location, type }
 */
merchantsRouter.post("/merchants", async (req, res) => {
  try {
    const existingMerchant = await Merchant.findOne({ name: req.body.name });
    if (existingMerchant) {
      res.status(404).send({ error: "Ya hay un mercader con ese nombre" });
      return;
    }

    const merchant = new Merchant(req.body);
    await merchant.save();
    res.status(201).send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Busca mercaderes que coincidan con la query en la base de datos.
 * @route GET /merchants
 * @query Parámetros opcionales de búsqueda
 */
merchantsRouter.get("/merchants", async (req, res) => {
  try {
    const merchants = await Merchant.find(req.query);
    res.status(200).send(merchants);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Busca un mercader por su ID en la base de datos.
 * @route GET /merchants/:id
 * @param id ID del mercader
 */
merchantsRouter.get("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      res.status(404).send({ error: "Mercader no encontrado" });
      return;
    }
    res.send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Actualiza un mercader específico según su ID.
 * @route PATCH /merchants/:id
 * @param id ID del mercader
 * @body Campos a actualizar
 */
merchantsRouter.patch("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      res.status(404).send({ error: "Mercader no encontrado" });
      return;
    }

    const allowedUpdates = ["name", "age", "location", "type"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({ error: "Actualización no permitida" });
      return;
    }

    Object.assign(merchant, req.body);
    await merchant.save();
    res.send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Actualiza todos los mercaderes que coincidan con la query.
 * @route PATCH /merchants
 * @query Parámetros de búsqueda
 * @body Campos a actualizar
 */
merchantsRouter.patch("/merchants", async (req, res) => {
  try {
    const merchants = await Merchant.find(req.query);

    if (merchants.length === 0) {
      res.status(404).send({ error: "No se han encontrado mercaderes con esa query" });
      return;
    }

    const allowedUpdates = ["name", "age", "location", "type"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({ error: "Actualización no permitida" });
      return;
    }

    const updatedMerchants = [];
    for (const merchant of merchants) {
      Object.assign(merchant, req.body);
      await merchant.save();
      updatedMerchants.push(merchant);
    }

    res.send(updatedMerchants);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Elimina un mercader específico según su ID.
 * @route DELETE /merchants/:id
 * @param id ID del mercader
 */
merchantsRouter.delete("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findByIdAndDelete(req.params.id);
    if (!merchant) {
      res.status(404).send({ error: "Mercader no encontrado" });
      return;
    }
    res.send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Elimina todos los mercaderes que coincidan con la query.
 * @route DELETE /merchants
 * @query Parámetros de búsqueda
 */
merchantsRouter.delete("/merchants", async (req, res) => {
  try {
    const merchants = await Merchant.find(req.query);
    if (merchants.length === 0) {
      res.status(404).send({ error: "No se han encontrado mercaderes con esa query" });
      return;
    }

    const deletedMerchants = [];
    for (const merchant of merchants) {
      await merchant.deleteOne();
      deletedMerchants.push(merchant);
    }

    res.send(deletedMerchants);
  } catch (error) {
    res.status(500).send(error);
  }
});