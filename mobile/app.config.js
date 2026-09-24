// Extends app.json with settings that depend on the build environment.
const fs = require("fs");

module.exports = ({ config }) => {
  const android = { ...config.android };
  // Push notifications on Android need your own Firebase google-services.json.
  // Without it the app still builds; push notifications are just disabled.
  if (!fs.existsSync("./google-services.json")) {
    delete android.googleServicesFile;
  }

  const extra = { ...config.extra };
  // Set by `eas init` / `eas build` (EAS_PROJECT_ID) for your own Expo account
  if (process.env.EAS_PROJECT_ID) {
    extra.eas = { projectId: process.env.EAS_PROJECT_ID };
  }

  return { ...config, android, extra };
};
