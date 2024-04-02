import { app } from "./app";
import { env } from "./env";
import { dietsRoutes } from "@/routes/diets";

app.register(dietsRoutes);

app
  .listen({
    port: env.PORT,
    host: "RENDER" in process.env ? "0.0.0.0" : "localhost",
  })
  .then(() => {
    console.log("Server is running on port 3333");
  });
