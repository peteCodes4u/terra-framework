// server.js file is used for setting up the server and starting the server. It is the entry point for the express application.
// The server.js file is used to import the express module and set up the virtual server. It also imports the routes and connects to the database.
// The server.js file is used to start the server and listen for incoming requests.
// The server.js file is used to set up the server to serve static files in production.
// The server.js file is used to connect to the database and start the server.

// import dotenv package to read .env file - THIS IS REQUIRED TO KEEP SENSITIVE (ENVIRONMENT) INFO SAFE and SECURE.

require('dotenv').config();
const {getAvailability} = require('./utils/getAvailability');
const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Availability endpoint
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

// server client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.use(routes);

db.once("open", () => {
  app.listen(PORT, () => console.log(`🛸 Now listening on localhost:${PORT}`));
});
