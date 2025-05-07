import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Good } from "../src/models/goodModel.js";

const goodSample = {
  name: "Espada de Plata",
  description: "Una espada de plata para luchar contra monstruos",
  material: "Iron",
  weight: 3,
  value: 200,
  quantity: 2,
};

beforeEach(async () => {
  await Good.deleteMany();
  await new Good(goodSample).save();
});

describe("POST /goods", () => {
  test("Should create a new good", async () => {
    const res = await request(app)
      .post("/goods")
      .send({
        name: "Pocima Verde",
        description: "Regeneracion de vida",
        material: "Herbs",
        weight: 5,
        value: 10,
      })
      .expect(201);
    expect(res.body).to.include({
      name: "Pocima Verde",
      description: "Regeneracion de vida",
      material: "Herbs",
      weight: 5,
      value: 10,
      quantity: 20,
    });
    const createdGood = await Good.findById(res.body._id);
    expect(createdGood).not.toBe(null);
    expect(createdGood!.name).toBe("Pocima Verde");
  });
  test("Should return 500 if required fields are missing", async () => {
    await request(app)
      .post("/goods")
      .send({
        name: "Espada Rota",
        weight: 3,
      }) 
      .expect(500);
  });
  test("Should return 500 if values are invalid", async () => {
    await request(app)
      .post("/goods")
      .send({
        name: "Piedra Maldita",
        description: "Una piedra que nadie quiere",
        material: "Stone",
        weight: -10,
        value: 5,
        quantity: 1,
      })
      .expect(500);
  });  
  test("Should not allow duplicate good name", async () => {
    await request(app).post("/goods").send(goodSample).expect(404);
  });
});

describe("GET /goods", () => {
  test("Should get all goods", async () => {
    const res = await request(app).get("/goods").expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /goods/:id", () => {
  test("Should get a good by ID", async () => {
    const good = await Good.findOne({ name: "Espada de Plata" });
    await request(app).get(`/goods/${good._id}`).expect(200);
  });
  test("Should return 404 for non-existent good ID", async () => {
    await request(app).get("/goods/000000000000000000000000").expect(404);
  });
});

describe("PATCH /goods", () => {
  test("Should update good(s) via query", async () => {
    await request(app)
      .patch("/goods?name=Espada%20de%20Plata")
      .send({ value: 100 })
      .expect(200);
  });
  test("Should not update if validation fails (negative weight)", async () => {
    await request(app)
      .patch("/goods?name=Espada%20de%20Plata")
      .send({ weight: -5 })
      .expect(500);
  });});

describe("PATCH /goods/:id", () => {
  test("Should update a good by ID", async () => {
    const good = await Good.findOne({ name: "Espada de Plata" });
    const res = await request(app)
      .patch(`/goods/${good._id}`)
      .send({ quantity: 10 })
      .expect(200);
    expect(res.body.quantity).toBe(10);
  });
  test("Should fail when setting weight to a negative value", async () => {
    const good = await Good.findOne({ name: "Espada de Plata" });
    await request(app)
      .patch(`/goods/${good._id}`)
      .send({ weight: -10 })
      .expect(500);
  });});

describe("DELETE /goods", () => {
  test("Should delete good(s) via query", async () => {
    await request(app).delete("/goods?name=Espada%20de%20Plata").expect(200);
  });
  test("Should return 404 if no good matches the query", async () => {
    await request(app).delete("/goods?name=Nonexistent").expect(404);
  });
  test("Should return 400 if trying to update a non-allowed field", async () => {
    await request(app)
      .patch("/goods?name=Espada%20de%20Plata")
      .send({ fakeField: "fake" }) 
      .expect(400);
  });
  
});

describe("DELETE /goods/:id", () => {
  test("Should delete a good by ID", async () => {
    const good = await Good.findOne({ name: "Espada de Plata" });
    await request(app).delete(`/goods/${good._id}`).expect(200);
  });
  test("Should return 404 when deleting non-existent good", async () => {
    await request(app).delete("/goods/000000000000000000000000").expect(404);
  });
});
