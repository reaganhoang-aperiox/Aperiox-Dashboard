import { initDatabase, ensureAdminUser } from "./db.js";

// Initialize database and ensure admin user
(async () => {
  await initDatabase();
  await ensureAdminUser();
})();
