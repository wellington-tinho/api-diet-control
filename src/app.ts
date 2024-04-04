import fastify from "fastify";
import { dietsRoutes } from "@/routes/diets";
import cookie from "@fastify/cookie";

export const app = fastify({ logger: true });

app.register(cookie);

app.register(dietsRoutes, {
  prefix: "meals",
});
