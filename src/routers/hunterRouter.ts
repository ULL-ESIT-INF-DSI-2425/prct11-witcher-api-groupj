import express from "express";
import { Hunter } from "../models/hunterModel.js";

export const hunterRouter = express.Router();

/**
 * Crea un nuevo cazador en la base de datos.
 * @route POST /hunters
 * @body { name, age, race, location }
 */
hunterRouter.post("/hunters", async (req, res) => {
  try {
    const existingHunter = await Hunter.findOne({ name: req.body.name });
    if (existingHunter) {
      res.status(404).send({ error: "Ya hay un cazador con ese nombre" });
      return;
    }

    const hunter = new Hunter(req.body);
    await hunter.save();
    res.status(201).send(hunter);
  } catch (error) {
    res.status(500).send(error);
  }
});


/**
 * Busca cazadores que coincidan con la query en la base de datos.
 * @route GET /hunters
 * @query Parámetros opcionales de búsqueda
 */
hunterRouter.get("/hunters", async (req, res) => {
  try {
    const query = req.query;
    const hunters = await Hunter.find(query);
    res.status(200).send(hunters);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Busca un cazador por su ID en la base de datos.
 * @route GET /hunters/:id
 * @param id ID del cazador
 */
hunterRouter.get("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findById(req.params.id);
    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({ error: "Cazador no encontrado" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Actualiza un cazador específico según su ID.
 * @route PATCH /hunters/:id
 * @param id ID del cazador
 * @body Campos a actualizar
 */
hunterRouter.patch("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findById(req.params.id);
    if (!hunter) {
      res.status(404).send({ error: "Cazador no encontrado" });
      return;
    }
    const allowedUpdates = ["name", "location", "age", "race"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate) {
      res.status(400).send({
        error: "Actualización no permitida",
      });
      return;
    }
    Object.assign(hunter, req.body);
    await hunter.save();
    res.send(hunter);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Actualiza todos los cazadores que coincidan con la query.
 * @route PATCH /hunters
 * @query Parámetros de búsqueda
 * @body Campos a actualizar
 */
hunterRouter.patch("/hunters", async (req, res) => {
  try {
    const query = req.query;
    const hunters = await Hunter.find(query);

    if (hunters.length === 0) {
      res.status(404).send({ error: "No se han encontrado cazadores con esa query" });
      return;
    }

    const allowedUpdates = ["name", "location", "age", "race"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "Actualización no permitida",
      });
      return;
    }

    const updatedHunters = [];
    for (const hunter of hunters) {
      Object.assign(hunter, req.body);
      await hunter.save();
      updatedHunters.push(hunter);
    }

    res.send(updatedHunters);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Elimina un cazador específico según su ID.
 * @route DELETE /hunters/:id
 * @param id ID del cazador
 */
hunterRouter.delete("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findByIdAndDelete(req.params.id);
    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send();
    } 
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Elimina todos los cazadores que coincidan con la query.
 * @route DELETE /hunters
 * @query Parámetros de búsqueda
 */
hunterRouter.delete("/hunters", async (req, res) => {
  try {
    const query = req.query;
    const hunters = await Hunter.find(query);

    if (hunters.length === 0) {
      res.status(404).send({ error: "No se han encontrado cazadores con esa query" });
      return;
    }

    const deletedHunters = [];
    for (const hunter of hunters) {
      await hunter.deleteOne();
      deletedHunters.push(hunter);
    }

    res.send(deletedHunters);
  } catch (error) {
    res.status(500).send(error);
  }
});
