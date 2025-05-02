import express from "express";
import { Hunter } from "../models/hunters.js";

export const hunterRouter = express.Router();

hunterRouter.post("/hunters", async (req, res) => {
  const hunter = new Hunter(req.body);
  try {
    await hunter.save();
    res.status(201).send(hunter);
  } catch (error) {
    res.status(400).send(error);
  }
});

hunterRouter.get("/hunters", async (req, res) => {
  try {
    if (req.query.name) {
      const hunter = await Hunter.find({ name: req.query.name });
      if (hunter.length > 0) {
        res.send(hunter);
      } else {
        res.status(404).send({ error: "Hunter not found" });
      }
    } else {
      const hunters = await Hunter.find();
      res.send(hunters);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.get("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findById(req.params.id);
    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({ error: "Hunter not found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.get("/hunters/location/:location", async (req, res) => {
  try {
    const hunters = await Hunter.find({ location: req.params.location });

    if (hunters.length > 0) {
      res.send(hunters);
    } else {
      res.status(404).send({ error: "No hunters found in this location" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

hunterRouter.get("/hunters/race/:race", async (req, res) => {
  try {
    const hunters = await Hunter.find({ race: req.params.race });

    if (hunters.length > 0) {
      res.send(hunters);
    } else {
      res.status(404).send({ error: "No hunters found with this race" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});


hunterRouter.patch("/hunter", async (req, res) => {
  if (!req.query.id) {
    res.status(400).send({
      error: "An id must be provided in the query string",
    });
  } else {
    const allowedUpdates = ["name", "type", "location"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      res.status(400).send({ error: "Invalid updates!" });
    } else {
      try {
        const hunter = await Hunter.findOneAndUpdate(
          {
            _id: req.query.id.toString(),
          },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );
        if (!hunter) {
          res.status(404).send();
        } else {
          res.send(hunter);
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }
});

// 7. Eliminar cazador por ID
hunterRouter.delete("/hunters/:id", async (req, res) => {
  try {
    const hunter = await Hunter.findByIdAndDelete(req.params.id);

    if (hunter) {
      res.send(hunter);
    } else {
      res.status(404).send({ error: "Hunter not found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
