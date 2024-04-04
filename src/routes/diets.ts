import { FastifyInstance } from "fastify";
import { knex } from "@/database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "@/middlewares/check-session-id-exists";

export async function dietsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const diets = await knex("meals").where("session_id", sessionId).select();

      return {
        diets: diets.map((diet) => ({
          id: diet.id,
          name: diet.name,
          description: diet.description,
          created_at: diet.created_at,
          updated_at: diet.updated_at,
          is_in_the_diet: !!diet.is_in_the_diet,
        })),
      };
    },
  );

  app.post("/", async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isInTheDiet: z.boolean(),
    });

    const { name, description, isInTheDiet } = createMealBodySchema.parse(
      request.body,
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      is_in_the_diet: isInTheDiet,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getMealBodySchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealBodySchema.parse(request.params);

      const { sessionId } = request.cookies;

      const diet = await knex("meals")
        .where({
          session_id: sessionId,
          id,
        })
        .first();

      return {
        diet: {
          id: diet.id,
          name: diet.name,
          description: diet.description,
          created_at: diet.created_at,
          updated_at: diet.updated_at,
          is_in_the_diet: !!diet.is_in_the_diet,
        },
      };
    },
  );
}
