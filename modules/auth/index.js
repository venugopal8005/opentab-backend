import authRoutes from "./routes/auth.routes.js";
import { createUserModel } from "./models/User.js";
import { protect } from "./middlewares/auth.middleware.js";

let User;

export const initAuth = ({ app, db, options = {} }) => {
  if (!app) throw new Error("Express app instance is required");
  if (!db) throw new Error("Database instance is required");

  // bind model to backend mongoose instance
  User = createUserModel(db);

  const prefix = options.routePrefix || "/auth";
  app.use(prefix, authRoutes);
};

export { protect };
export { User };
