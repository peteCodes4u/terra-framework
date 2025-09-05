// server.js
require('dotenv').config();
import express from "express";
import path from "path";
import db from "./config/connection.js";
import { getAvailability } from "../utils/getAvailability.js";
import userController from "./controllers/user-controller.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------
// API Routes
// -------------------

// Availability endpoint (works exactly like login)
app.get("/api/availability", (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing required query param: date" });
  }

  try {
    const availability = getAvailability(date);
    res.json(availability);
  } catch (err) {
    console.error("Error getting availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// User routes
app.post("/api/users", userController.createUser);
app.post("/api/users/login", userController.login);
app.get("/api/users/:id", userController.getSingleUser);
app.put("/api/users/:id", userController.updateUser);
app.delete("/api/users/:id", userController.deleteUser);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}

// Start server
db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`🛸 Server running at http://localhost:${PORT}`);
  });
});
