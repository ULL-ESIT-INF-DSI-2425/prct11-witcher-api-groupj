import { describe, test } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

export const defaultRouterTests = () => {
  describe("Default Router - Rutas no implementadas", () => {
    test("Should return 501 for unknown GET route", async () => {
      await request(app).get("/sioque").expect(501);
    });

    test("Should return 501 for unknown POST route", async () => {
      await request(app).post("/noexisteloco").send({ key: "value" }).expect(501);
    });

    test("Should return 501 for unknown DELETE route", async () => {
      await request(app).delete("/teguestelibre").expect(501);
    });
  });
};