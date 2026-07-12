import app from "./app.js";
import { closeDatabase } from "./db.js";

const port = Number(process.env.PORT) || 4174;
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Wiki archive server listening on http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
