/**
 * Created by Shaoke Xu on 4/29/18.
 */

// =================================================
// WARNING: This function must be called in the top
// =================================================
const { addNodeModuleFromConfigJSON } = require('./utils/nodeModules');
addNodeModuleFromConfigJSON();
const enableDestroy = require("server-destroy");
const config = require("./utils/config");
const createApp = require("./app");

async function startServer() {
  try {
    const app = await createApp();
    const server = app.listen(config.PORT, function() {
      console.info(
        "Express server listening on http://localhost:%d/ in %s mode",
        config.PORT,
        app.get("env")
      );
    });

    enableDestroy(server);

    // Handle signals gracefully. Heroku will send SIGTERM before idle.
    process.on("SIGTERM", () => {
      console.info(`SIGTERM received`);
      console.info("Closing http.Server ..");
      server.destroy();
    });
    process.on("SIGINT", () => {
      console.info(`SIGINT(Ctrl-C) received`);
      console.info("Closing http.Server ..");
      server.destroy();
    });

    server.on("close", () => {
      console.info("Server closed");
      // process.emit("cleanup");

      console.info("Giving 100ms time to cleanup..");
      // Give a small time frame to clean up
      setTimeout(process.exit, 100);
    });
  } catch (err) {
    throw err;
  }
}

module.exports = startServer;