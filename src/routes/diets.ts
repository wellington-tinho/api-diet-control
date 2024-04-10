import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

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
          date: diet.date,
          updated_at: diet.updated_at,
          is_in_the_diet: !!diet.is_in_the_diet,
        })),
      };
    },
  );

  app.get(
    "/metrics",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const diets = await knex("meals").where("session_id", sessionId).select();

      const totalMeals = diets.length;
      const totalMealsInTheDiet = diets.filter(
        (diet) => diet.is_in_the_diet,
      ).length;
      const totalMealsNotInTheDiet = diets.filter(
        (diet) => !diet.is_in_the_diet,
      ).length;
      const bestSequence = diets.reduce(
        (acc, diet) => {
          if (diet.is_in_the_diet) {
            acc.currentSequence += 1;
            acc.bestSequence = Math.max(acc.bestSequence, acc.currentSequence);
          } else {
            acc.currentSequence = 0;
          }
          return acc;
        },
        {
          bestSequence: 0,
          currentSequence: 0,
        },
      );
      return {
        metrics: {
          totalMeals,
          totalMealsInTheDiet,
          totalMealsNotInTheDiet,
          bestSequence: bestSequence.bestSequence,
        },
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
      const getMealParamSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const diet = await knex("meals").where({
        session_id: sessionId,
        id,
      });

      return {
        diet: diet.map((diet) => ({
          id: diet.id,
          name: diet.name,
          description: diet.description,
          date: diet.date,
          updated_at: diet.updated_at,
          is_in_the_diet: !!diet.is_in_the_diet,
        }))[0],
      };
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getMealParamSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamSchema.parse(request.params);

      const { sessionId } = request.cookies;

      await knex("meals")
        .where({
          session_id: sessionId,
          id,
        })
        .delete();
    },
  );

  app.patch(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getMealBodySchema = z
        .object({
          name: z.string(),
          description: z.string(),
          date: z.date(),
          isInTheDiet: z.boolean(),
        })
        .partial()
        .refine(
          (data) => {
            // Verifica se pelo menos um dos campos está presente
            return (
              data.name || data.description || data.date || data.isInTheDiet
            );
          },
          {
            message: "Você deve fornecer pelo menos um campo para atualizar.",
          },
        );

      const getMealParamSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamSchema.parse(request.params);

      const { sessionId } = request.cookies;

      await knex("meals")
        .where({
          session_id: sessionId,
          id,
        })
        .update({
          ...getMealBodySchema.parse(request.body),
          updated_at: knex.fn.now(),
        });
    },
  );
}
