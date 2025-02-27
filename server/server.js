require("dotenv").config();
const express = require("express");
const path = require("path");
const db = require("./config/connection");
const userRoutes = require("./routes/api/user-routes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// server client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.use("/api", userRoutes);

db.once("open", () => {
  app.listen(PORT, () => console.log(`🛸 Now listening on localhost:${PORT}`));
});
