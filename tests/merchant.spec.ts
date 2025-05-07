import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Merchant } from "../src/models/merchantModel.js";

const merchantSample = {
  name: "Geralt",
  age: 45,
  location: "Maribor",
  type: "trader",
};

beforeEach(async () => {
  await Merchant.deleteMany();
  await new Merchant(merchantSample).save();
});

describe("POST /merchants", () => {
  test("Should create a new merchant", async () => {
    const res = await request(app)
      .post("/merchants")
      .send({
        name: "Tristana",
        age: 30,
        location: "Cintra",
        type: "alchemist",
      })
      .expect(201);
    expect(res.body).to.include({
      name: "Tristana",
      age: 30,
      location: "Cintra",
      type: "alchemist",
    });
  });

  test("Should not allow duplicate merchant name", async () => {
    await request(app).post("/merchants").send(merchantSample).expect(404);
  });

  test("Should return 500 if required fields are missing", async () => {
    await request(app)
      .post("/merchants")
      .send({ name: "Eskel" })
      .expect(500);
  });

  test("Should return 500 if age is invalid", async () => {
    await request(app)
      .post("/merchants")
      .send({
        name: "Vesemir77",
        age: -1,
        location: "Verden",
        type: "blacksmith",
      })
      .expect(500);
  });
});

describe("GET /merchants", () => {
  test("Should get all merchants", async () => {
    const res = await request(app).get("/merchants").expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /merchants/:id", () => {
  test("Should get a merchant by ID", async () => {
    const merchant = await Merchant.findOne({ name: "Geralt" });
    await request(app).get(`/merchants/${merchant._id}`).expect(200);
  });

  test("Should return 404 for non-existent merchant ID", async () => {
    await request(app).get("/merchants/000000000000000000000000").expect(404);
  });
});

describe("PATCH /merchants", () => {
  test("Should update merchant(s) via query", async () => {
    await request(app)
      .patch("/merchants?name=Geralt")
      .send({ location: "Brugge" })
      .expect(200);
  });

  test("Should not update if field is invalid", async () => {
    await request(app)
      .patch("/merchants?name=Geralt")
      .send({ fakeField: "invalid" })
      .expect(400);
  });
});

describe("PATCH /merchants/:id", () => {
  test("Should update a merchant by ID", async () => {
    const merchant = await Merchant.findOne({ name: "Geralt" });
    const res = await request(app)
      .patch(`/merchants/${merchant._id}`)
      .send({ age: 50 })
      .expect(200);
    expect(res.body.age).toBe(50);
  });

  test("Should fail with invalid field update", async () => {
    const merchant = await Merchant.findOne({ name: "Geralt" });
    await request(app)
      .patch(`/merchants/${merchant._id}`)
      .send({ notValid: 1 })
      .expect(400);
  });
});

describe("DELETE /merchants", () => {
  test("Should delete merchant(s) via query", async () => {
    await request(app).delete("/merchants?name=Geralt").expect(200);
  });

  test("Should return 404 if no merchants match query", async () => {
    await request(app).delete("/merchants?name=NoExiste").expect(404);
  });
});

describe("DELETE /merchants/:id", () => {
  test("Should delete a merchant by ID", async () => {
    const merchant = await Merchant.findOne({ name: "Geralt" });
    await request(app).delete(`/merchants/${merchant._id}`).expect(200);
  });

  test("Should return 404 when merchant not found", async () => {
    await request(app).delete("/merchants/000000000000000000000000").expect(404);
  });
});
