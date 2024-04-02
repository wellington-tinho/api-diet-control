import { FastifyInstance } from "fastify";
import { knex } from "@/database";

export async function dietsRoutes(app: FastifyInstance) {
  app.get("/diets", async () => {
    const diets = await knex("meals").select("*");

    return diets;
  });
}
