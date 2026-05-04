const fs = require("fs");
const path = require("path");

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, "..", "logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const getDateString = () => new Date().toISOString().split("T")[0];

const logStreams = {};

const getLogStream = (filename) => {
  const dateString = getDateString();
  const streamKey = `${filename}-${dateString}`;
  
  if (!logStreams[streamKey]) {
    const filepath = path.join(LOG_DIR, `${streamKey}.log`);
    logStreams[streamKey] = fs.createWriteStream(filepath, { flags: "a" });
  }
  
  return logStreams[streamKey];
};

const formatLog = (level, message, meta = {}) => {
  const log = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...meta
  };
  return JSON.stringify(log) + "\n";
};

const logger = {
  info: (message, meta) => {
    const logStream = getLogStream("info");
    logStream.write(formatLog("info", message, meta));
  },
  
  error: (message, meta) => {
    const logStream = getLogStream("error");
    logStream.write(formatLog("error", message, meta));
    console.error(`[ERROR] ${message}`, meta);
  },
  
  warn: (message, meta) => {
    const logStream = getLogStream("warn");
    logStream.write(formatLog("warn", message, meta));
  },
  
  payment: (message, meta) => {
    const logStream = getLogStream("payment");
    logStream.write(formatLog("payment", message, meta));
    console.log(`[PAYMENT] ${message}`);
  },
  
  auth: (message, meta) => {
    const logStream = getLogStream("auth");
    logStream.write(formatLog("auth", message, meta));
  },
  
  admin: (message, meta) => {
    const logStream = getLogStream("admin");
    logStream.write(formatLog("admin", message, meta));
  }
};

module.exports = logger;