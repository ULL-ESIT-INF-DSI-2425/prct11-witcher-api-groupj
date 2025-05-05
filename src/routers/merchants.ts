import express from "express";
import { Merchant } from "../models/merchants.js";

export const merchantsRouter = express.Router();

/**
 * POST - Añadir un nuevo mercader
 */
merchantsRouter.post("/merchants", async (req, res) => {
  const merchant = new Merchant(req.body);
  try {
    await merchant.save();
    res.status(201).send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * GET - Buscar mercaderes (con filtros opcionales)
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
 * GET - Buscar un mercader por ID
 */
merchantsRouter.get("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      res.status(404).send();
      return;
    }
    res.send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * PATCH - Actualizar mercader por query
 */
merchantsRouter.patch("/merchants", async (req, res) => {
  try {
    const merchants = await Merchant.find(req.query);

    if (merchants.length === 0) {
      res.status(404).send({ error: "No merchants found matching the query" });
      return;
    }

    const allowedUpdates = ["name", "age", "location", "type"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({ error: "Update is not permitted" });
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
 * PATCH - Actualizar mercader por ID
 */
merchantsRouter.patch("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      res.status(404).send();
      return;
    }

    const allowedUpdates = ["name", "age", "location", "type"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      res.status(400).send({ error: "Update is not permitted" });
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
 * DELETE - Eliminar mercader por query
 */
merchantsRouter.delete("/merchants", async (req, res) => {
  try {
    const merchants = await Merchant.find(req.query);
    if (merchants.length === 0) {
      res.status(404).send({ error: "No merchants found matching the query" });
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

/**
 * DELETE - Eliminar mercader por ID
 */
merchantsRouter.delete("/merchants/:id", async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      res.status(404).send({ error: "No merchant found with that ID" });
      return;
    }
    await merchant.deleteOne();
    res.send(merchant);
  } catch (error) {
    res.status(500).send(error);
  }
});
