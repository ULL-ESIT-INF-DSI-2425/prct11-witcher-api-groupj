import { describe, test, beforeEach, expect, afterAll } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../src/app.js";
import { Transaction } from "../src/models/transactionModel.js";
import { Hunter } from "../src/models/hunterModel.js";
import { Merchant } from "../src/models/merchantModel.js";
import { Good } from "../src/models/goodModel.js";

const hunterSample = {
  name: "Geralt",
  age: 100,
  race: "Witcher",
  location: "Maribor",
};

const hunterSample2 = {
  name: "Jose",
  age: 100,
  race: "Witcher",
  location: "Maribor",
};

const merchantSample = {
  name: "Hattori",
  age: 45,
  location: "Cintra",
  type: "blacksmith",
};

const goodSample = {
  name: "Silver Sword",
  description: "A sword made of silver, effective against monsters.",
  material: "Silver",
  weight: 3.5,
  value: 150,
  quantity: 10,
};

const transactionSample = {
  type: "purchase",
  client: "Geralt",
  goods: [
    {
      name: "Silver Sword",
      quantity: 2,
    },
  ],
};

beforeEach(async () => {
  await Transaction.deleteMany();
  await Hunter.deleteMany();
  await Merchant.deleteMany();
  await Good.deleteMany();

  const hunter = await new Hunter(hunterSample).save();
  const hunter2 = await new Hunter(hunterSample2).save();
  const merchant = await new Merchant(merchantSample).save();
  const good = await new Good(goodSample).save();

  await new Transaction({
    type: "purchase",
    client: hunter._id,
    goods: [{ good: good._id, quantity: 2 }],
    totalValue: 300,
  }).save();
});

afterAll(async () => {
  await Transaction.deleteMany();
  await Hunter.deleteMany();
  await Merchant.deleteMany();
  await Good.deleteMany();

  await mongoose.connection.close();
});

describe("GET /transactions/:id", () => {
  test("Should return a transaction by ID", async () => {
    const transaction = await Transaction.findOne();
    const res = await request(app)
      .get(`/transactions/${transaction._id}`)
      .expect(200);

    expect(res.body).toMatchObject({
      type: "purchase",
      totalValue: 300,
    });
  });

  test("Should return 404 if transaction not found", async () => {
    const res = await request(app)
      .get("/transactions/645c1f2e5b3c2a001f5e8a9b") // Non-existent ID
      .expect(404);

    expect(res.body).toHaveProperty("error", "Transaction not found");
  });
});

describe("GET /transactions/by-name", () => {
  test("Should return transactions by hunter name", async () => {
    const res = await request(app)
      .get("/transactions/by-name?name=Geralt")
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      type: "purchase",
      totalValue: 300,
    });
  });

  test("Should return 404 if no transactions found for the name", async () => {
    const res = await request(app)
      .get("/transactions/by-name?name=Hattori")
      .expect(404);

    expect(res.body).toHaveProperty("error", "No transactions found for that name.");
  });
});

describe("GET /transactions/by-date", () => {
  test("Should return transactions within a date range", async () => {
    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(); // 1 day ago
    const endDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 1 day in the future

    const res = await request(app)
      .get(`/transactions/by-date?start=${startDate}&end=${endDate}&type=purchase`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      type: "purchase",
      totalValue: 300,
    });
  });

  test("Should return 404 if no transactions found in the date range", async () => {
    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days ago
    const endDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(); // 6 days ago

    const res = await request(app)
      .get(`/transactions/by-date?start=${startDate}&end=${endDate}&type=purchase`)
      .expect(404);

    expect(res.body).toHaveProperty("error", "No transactions found for the specified criteria.");
  });
});

describe("PATCH /transactions/:id", () => {
  test("Should update a transaction", async () => {
    const transaction = await Transaction.findOne();
    const res = await request(app)
      .patch(`/transactions/${transaction._id}`)
      .send({
        goods: [
          {
            name: "Silver Sword",
            quantity: 3,
          },
        ],
      })
      .expect(200);

    expect(res.body).toMatchObject({
      type: "purchase",
      totalValue: 450, // Updated total value
    });

    const updatedTransaction = await Transaction.findById(transaction._id);
    expect(updatedTransaction?.goods[0].quantity).toBe(3);
  });

  test("Should return 404 if transaction not found", async () => {
    const res = await request(app)
      .patch("/transactions/645c1f2e5b3c2a001f5e8a9b") // Non-existent ID
      .send({
        goods: [
          {
            name: "Silver Sword",
            quantity: 3,
          },
        ],
      })
      .expect(404);

    expect(res.body).toHaveProperty("error", "Transaction not found.");
  });
});

describe("POST /transactions", () => {
  test("Should create a new transaction", async () => {
    const hunter = await Hunter.findOne({ name: "Geralt" });
    const good = await Good.findOne({ name: "Silver Sword" });

    const res = await request(app)
      .post("/transactions")
      .send({
        hunterName: "Geralt",
        goods: [
          {
            name: "Silver Sword",
            quantity: 1,
          },
        ],
      })
      .expect(201);

    expect(res.body).toMatchObject({
      type: "purchase",
      client: hunter?._id.toString(),
      totalValue: good?.value,
    });

    const createdTransaction = await Transaction.findById(res.body._id);
    expect(createdTransaction).not.toBeNull();
    expect(createdTransaction?.goods[0].quantity).toBe(1);
  });

  test("Should return 404 if hunter or good not found", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({
        hunterName: "Unknown Hunter",
        goods: [
          {
            name: "Nonexistent Good",
            quantity: 1,
          },
        ],
      })
      .expect(404);

    expect(res.body).toHaveProperty("error");
  });

  test("Should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({})
      .expect(400);

    expect(res.body).toHaveProperty("error", "You must specify a hunter or a merchant.");
  });
});

describe("DELETE /transactions/:id", () => {
  test("Should delete a transaction and update stock", async () => {
    const transaction = await Transaction.findOne();
    const good = await Good.findOne({ name: "Silver Sword" });

    const res = await request(app)
      .delete(`/transactions/${transaction?._id}`)
      .expect(200);

    expect(res.body).toHaveProperty("message", "Transaction deleted successfully");

    const deletedTransaction = await Transaction.findById(transaction?._id);
    expect(deletedTransaction).toBeNull();

    const updatedGood = await Good.findById(good?._id);
    expect(updatedGood?.quantity).toBe(good?.quantity + 2); // Stock reverted
  });

  test("Should return 404 if transaction not found", async () => {
    const res = await request(app)
      .delete("/transactions/645c1f2e5b3c2a001f5e8a9b") // Non-existent ID
      .expect(404);

    expect(res.body).toHaveProperty("error", "Transaction not found.");
  });
});