// Vercel serverless function wrapper for the Express API.
// Imports the pre-built ESM bundle (app.mjs) which exports just the
// Express app without app.listen() — safe for serverless execution.
import app from "../artifacts/api-server/dist/app.mjs";

export default app;
