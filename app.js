const express = require("express");
const app = express();
const port = 3000;
const winston = require("winston");
const path = require("path");

// Configuration de winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, "app.log") }),
  ],
});

app.use(express.json()); // To handle JSON payloads

// Middleware to log the request time
app.use((req, res, next) => {
  const startTime = process.hrtime();

  // Journaliser chaque requête
  logger.info({
    message: "HTTP Request",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  // When the response finishes, log the request time
  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    const timeTaken = diff[0] * 1000 + diff[1] / 1e6; // Convert to milliseconds
    logger.info({
      message: "Response sent",
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      timeTaken: timeTaken, // Log time taken as a number in milliseconds
      timestamp: new Date().toISOString(),
    });
  });

  next();
});

// Endpoint to add two numbers
// eslint-disable-next-line consistent-return
app.post("/add", (req, res) => {
  const { a, b } = req.body;

  if (typeof a !== "number" || typeof b !== "number") {
    logger.error({
      message: "Invalid operands",
      operands: { a, b },
      timestamp: new Date().toISOString(),
    });
    return res
      .status(400)
      .json({ error: "Invalid operands. Both a and b must be numbers." });
  }

  const result = a + b;

  // Log the addition operation
  logger.info({
    message: "Addition operation",
    operands: { a, b },
    result,
    timestamp: new Date().toISOString(),
  });

  res.status(200).json({ result });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Middleware for handling 404 errors
app.use((req, res, next) => {
  logger.error({
    message: "404 Not Found",
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  res.status(404).json({ error: "Not Found" });
});

// Start server
if (require.main === module) {
  app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;
