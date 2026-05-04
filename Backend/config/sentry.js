let Sentry;

try {
  Sentry = require("@sentry/node");
} catch (error) {
  console.warn("Sentry packages not installed. Skipping Sentry initialization.", error.message);
  module.exports = () => null;
  return;
}

const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn("SENTRY_DSN is not configured. Sentry will remain disabled.");
    return null;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.05"),
    release: process.env.SENTRY_RELEASE || `lms-backend@${process.env.npm_package_version || "1.0.0"}`,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration()
    ]
  });

  console.log("✅ Sentry initialized");
  return Sentry;
};

module.exports = initSentry;