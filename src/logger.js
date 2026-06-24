const levels = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function createLogger(level = "info") {
  const threshold = levels[level] ?? levels.info;

  function write(levelName, message, details) {
    if ((levels[levelName] ?? levels.info) < threshold) {
      return;
    }

    const payload = {
      level: levelName,
      time: new Date().toISOString(),
      message,
      ...(details ? { details } : {}),
    };

    const stream = levelName === "error" ? console.error : console.log;
    stream(JSON.stringify(payload));
  }

  return {
    debug: (message, details) => write("debug", message, details),
    info: (message, details) => write("info", message, details),
    warn: (message, details) => write("warn", message, details),
    error: (message, details) => write("error", message, details),
  };
}
