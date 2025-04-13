import { createServer } from "@tonk/server";

createServer({
  port: 6080,
  mode: "development",
  distPath: undefined
}); // 👈 This gives you the /sync endpoint
