import { describe, test, beforeEach, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Hunter } from "../src/models/hunterModel.js";

export function runHunterTests() {
  describe("HUNTER ROUTES", () => {
    const hunterSample = {
      name: "Geralt",
      age: 100,
      race: "Bandit",
      location: "Verden",
    };

    beforeEach(async () => {
      await Hunter.deleteMany();
      await new Hunter(hunterSample).save();
    });

    afterAll(async () => {
      await Hunter.deleteMany();
    });

    describe("POST /hunters", () => {
      test("Should create a new hunter", async () => {
        const res = await request(app)
          .post("/hunters")
          .send({
            name: "Lambert",
            age: 90,
            race: "Witcher",
            location: "Maribor",
          })
          .expect(201);
        expect(res.body).to.include({
          name: "Lambert",
          age: 90,
          race: "Witcher",
          location: "Maribor",
        });
      });
    
      test("Should not allow duplicate hunter name", async () => {
        await request(app).post("/hunters").send(hunterSample).expect(404);
      });
    
      test("Should return 500 if required fields are missing", async () => {
        await request(app)
          .post("/hunters")
          .send({ name: "Vesemir" })
          .expect(500);
      });
    
      test("Should return 500 if age is invalid", async () => {
        await request(app)
          .post("/hunters")
          .send({
            name: "Eskel",
            age: -10,
            race: "Humano",
            location: "Bosque",
          })
          .expect(500);
      });
    });
    
    describe("GET /hunters", () => {
      test("Should get all hunters", async () => {
        const res = await request(app).get("/hunters").expect(200);
        expect(res.body.length).toBeGreaterThan(0);
      });
    });
    
    describe("GET /hunters/:id", () => {
      test("Should get a hunter by ID", async () => {
        const hunter = await Hunter.findOne({ name: "Geralt" });
        await request(app).get(`/hunters/${hunter._id}`).expect(200);
      });
      test("Should return 404 for non-existent hunter ID", async () => {
        await request(app).get("/hunters/000000000000000000000000").expect(404);
      });
    });
    
    describe("PATCH /hunters", () => {
      test("Should update hunters via query", async () => {
        await request(app)
          .patch("/hunters?name=Geralt")
          .send({ location: "Verden" })
          .expect(200);
      });
      test("Should not update if field is invalid", async () => {
        await request(app)
          .patch("/hunters?name=Geralt")
          .send({ fakeField: "fake" })
          .expect(400);
      });
      test("Should return 404 if no hunters match the PATCH query", async () => {
        await request(app)
          .patch("/hunters?name=NoExiste")
          .send({ location: "Cintra" })
          .expect(404);
      });
      test("Should return 400 when trying to patch with invalid fields via query", async () => {
        await request(app)
          .patch("/hunters?name=Geralt")
          .send({ invalidField: "test" })
          .expect(400);
      });      
    });
    
    describe("PATCH /hunters/:id", () => {
      test("Should update a hunter by ID", async () => {
        const hunter = await Hunter.findOne({ name: "Geralt" });
        const res = await request(app)
          .patch(`/hunters/${hunter._id}`)
          .send({ age: 101 })
          .expect(200);
        expect(res.body.age).toBe(101);
      });
      test("Should return 404 when patching hunter by non-existent ID", async () => {
        await request(app)
          .patch("/hunters/000000000000000000000000")
          .send({ age: 80 })
          .expect(404);
      });      
      test("Should fail with invalid field update", async () => {
        const hunter = await Hunter.findOne({ name: "Geralt" });
        await request(app)
          .patch(`/hunters/${hunter._id}`)
          .send({ invalidField: true })
          .expect(400);
      });
      test("Should return 400 when trying to patch hunter by ID with invalid fields", async () => {
        const hunter = await Hunter.findOne({ name: "Geralt" });
        await request(app)
          .patch(`/hunters/${hunter._id}`)
          .send({ unknown: "field" })
          .expect(400);
      });
      
    });
    
    describe("DELETE /hunters", () => {
      test("Should delete hunters via query", async () => {
        await request(app)
          .delete("/hunters?name=Geralt")
          .expect(200);
      });
    
      test("Should return 404 if no hunters match query", async () => {
        await request(app).delete("/hunters?name=NoExiste").expect(404);
      });
      test("Should return 404 when trying to delete hunters by unmatched query", async () => {
        await request(app)
          .delete("/hunters?race=NoExiste")
          .expect(404);
      });
      
    });
    
    describe("DELETE /hunters/:id", () => {
      test("Should delete a hunter by ID", async () => {
        const hunter = await Hunter.findOne({ name: "Geralt" });
        await request(app).delete(`/hunters/${hunter._id}`).expect(200);
      });
    
      test("Should return 404 when hunter not found", async () => {
        await request(app).delete("/hunters/000000000000000000000000").expect(404);
      });
      test("Should return 404 when hunter not found", async () => {
        await request(app).delete("/hunters/000000000000000000000000").expect(404);
      });
      
    });
  });
}