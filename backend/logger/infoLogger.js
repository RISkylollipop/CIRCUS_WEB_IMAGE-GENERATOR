const fs = require("node:fs");
const path = require("node:path");

const logDirectory = path.join(__dirname, "..", "logs");
const logFile = path.join(logDirectory, "info.log");

function infoLogger(message, context = {}) {
  fs.mkdirSync(logDirectory, { recursive: true });
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level: "info", message, context });
  fs.appendFileSync(logFile, `${entry}\n`);
  console.log(message, context);
}

module.exports = infoLogger;
