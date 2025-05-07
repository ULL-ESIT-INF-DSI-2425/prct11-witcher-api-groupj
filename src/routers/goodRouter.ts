import express from "express";
import { Good } from "../models/goodModel.js";

export const goodsRouter = express.Router();

/**
 * Crea un nuevo bien en la base de datos.
 * @route POST /goods
 * @body { name, description, material, weight, value, quantity }
 */
goodsRouter.post("/goods", async (req, res) => {
  const good = new Good(req.body);
  try {
    await good.save();
    res.status(201).send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Busca bienes que coincidan con la query en la base de datos.
 * @route GET /goods
 * @query Parámetros opcionales de búsqueda
 */
goodsRouter.get("/goods", async (req, res) => {
  try {
    const query = req.query;
    const goods = await Good.find(query);
    res.status(200).send(goods);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Busca un bien por su ID en la base de datos.
 * @route GET /goods/:id
 * @param id ID del bien
 */
goodsRouter.get("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findById(req.params.id);
    if (!good) {
      res.status(404).send({ error: "Bien no encontrado" });
      return;
    }
    res.send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Actualiza todos los bienes que coincidan con la query.
 * @route PATCH /goods
 * @query Parámetros de búsqueda
 * @body Campos a actualizar
 */
goodsRouter.patch("/goods", async (req, res) => {
  try {
    const query = req.query;
    const goods = await Good.find(query);

    if (goods.length === 0) {
      res.status(404).send({ error: "No se han encontrados bienes por esa query" });
      return;
    }

    const allowedUpdates = [
      "id",
      "name",
      "description",
      "material",
      "weight",
      "value",
      "quantity"
    ];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "Actualizacion no permitida",
      });
      return;
    }

    const updatedGoods = [];
    for (const good of goods) {
      Object.assign(good, req.body);
      await good.save();
      updatedGoods.push(good);
    }

    res.send(updatedGoods);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Actualiza un bien específico según su ID.
 * @route PATCH /goods/:id
 * @param id ID del bien
 * @body Campos a actualizar
 */
goodsRouter.patch("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findById(req.params.id);
    if (!good) {
      res.status(404).send({ error: "Bien no encontrado" });
      return;
    }

    const allowedUpdates = [
      "name",
      "description",
      "material",
      "weight",
      "value",
      "quantity"
    ];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "Actualizacion no permitida",
      });
      return;
    }

    Object.assign(good, req.body);
    await good.save();
    res.send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Elimina todos los bienes que coincidan con la query.
 * @route DELETE /goods
 * @query Parámetros de búsqueda
 */
goodsRouter.delete("/goods", async (req, res) => {
  try {
    const query = req.query;
    const goods = await Good.find(query);
    if (goods.length === 0) {
      res.status(404).send({ error: "No se han encontrados bienes por esa query" });
      return;
    }
    const deletedGoods = [];
    for (const good of goods) {
      await good.deleteOne();
      deletedGoods.push(good);
    }

    res.send(deletedGoods);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Elimina un bien específico según su ID.
 * @route DELETE /goods/:id
 * @param id ID del bien
 */
goodsRouter.delete("/goods/:id", async (req, res) => {
  try {
    const good = await Good.findById(req.params.id);
    if (!good) {
      res.status(404).send({ error: "No se han encontrados bienes por esa ID" });
      return;
    }
    await good.deleteOne();
    res.send(good);
  } catch (error) {
    res.status(500).send(error);
  }
});