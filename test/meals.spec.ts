import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Meals routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new meal", async () => {
    await request(app.server)
      .post("/meals")
      .send({
        name: "New meal",
        description: "this is a test for create a new meal",
        isInTheDiet: true,
      })
      .expect(201);
  });

  it("should be able to list all meals", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/meals")
      .send({
        name: "New meal",
        description: "this is a test for list a meals created",
        isInTheDiet: true,
      });

    const cookies = createTransactionResponse.get("Set-Cookie")!;

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(listMealsResponse.body.diets[0]).toEqual(
      expect.objectContaining({
        name: "New meal",
        description: "this is a test for list a meals created",
        is_in_the_diet: true,
      }),
    );
  });

  it("should be able to get a specific meal", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/meals")
      .send({
        name: "New meal",
        description: "this is a test for get specific meal",
        isInTheDiet: true,
      });

    const cookies = createTransactionResponse.get("Set-Cookie")!;

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.diets[0].id;

    console.log(listMealsResponse.body.diets);

    const getTransactionResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTransactionResponse.body.diet).toEqual(
      expect.objectContaining({
        name: "New meal",
        description: "this is a test for get specific meal",
        is_in_the_diet: true,
      }),
    );
  });

  it("should be able to get the metrics", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/meals")
      .send({
        name: "New meal1",
        description: "this is a test for get specific meal",
        isInTheDiet: true,
      });

    const cookies = createTransactionResponse.get("Set-Cookie")!;

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "New meal2",
      description: "this is a test for get specific meal",
      isInTheDiet: true,
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "New meal3",
      description: "this is a test for get specific meal",
      isInTheDiet: false,
    });

    const metricResponse = await request(app.server)
      .get("/meals/metrics")
      .set("Cookie", cookies)
      .expect(200);

    expect(metricResponse.body.metrics).toEqual({
      totalMeals: 3,
      totalMealsInTheDiet: 2,
      totalMealsNotInTheDiet: 1,
      bestSequence: 2,
    });
  });
});
