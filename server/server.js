require("dotenv").config()
process.env.TZ = 'UTC';
const express = require("express");
const path = require("path");
const db = require("./config/connection");
const routes = require("./routes");
const availabilityRoutes = require('./routes/api/availability-routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/availability", availabilityRoutes);
app.use(routes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

db.once("open", () => {
  app.listen(PORT, () => console.log(`🛸 Now listening on localhost:${PORT}`));
});
