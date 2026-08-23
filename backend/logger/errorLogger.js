const fs = require("node:fs");
const path = require("node:path");

const logDirectory = path.join(__dirname, "..", "logs");
const logFile = path.join(logDirectory, "error.log");

function errorLogger(error, context = {}) {
  fs.mkdirSync(logDirectory, { recursive: true });
  const normalizedError = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { message: String(error) };
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level: "error", error: normalizedError, context });
  fs.appendFileSync(logFile, `${entry}\n`);
  console.error(error, context);
}

module.exports = errorLogger;
