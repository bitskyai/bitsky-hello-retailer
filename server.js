//-------------------------------------------------------------------------------------------
// Add additional node_modules. DON'T change and remove this.
const { addNodeModuleFromConfigJSON } = require("./utils/nodeModules");
addNodeModuleFromConfigJSON();
// Add @bitskyai/retailer-sdk - https://www.npmjs.com/package/@bitskyai/retailer-sdk
const baseRetailerService = require("@bitskyai/retailer-sdk");
const path = require("path");
//------------------------------------------------------------------------------------------

const _ = require("lodash");
const { settings, trigger, parse } = require("./worker");

module.exports = {
  // DON'T change and remove startServer
  startServer: async function startServer(customConfig) {
    //--------------------------------------------
    // Normally you don't need to change the code inside try/catch, but you still can change it if you need
    // Based on baseRetailerService APIs(https://www.npmjs.com/package/@bitskyai/retailer-sdk) to change
    try {
      // environment variable will overwrite settings
      const mergedSettings = _.merge(customConfig, settings);
      baseRetailerService.setConfigs(mergedSettings);
      baseRetailerService.trigger(trigger);
      baseRetailerService.parse(parse);
      baseRetailerService.express();
      baseRetailerService.routers();
      await baseRetailerService.getRetailerConfiguration();
      await baseRetailerService.listen();
      baseRetailerService.logger.info(`start server successful`, {
        configs: baseRetailerService.getConfigs(),
      });
      return baseRetailerService;
    } catch (err) {
      baseRetailerService.logger.error(`startServer fail - ${err.message}`, {
        error: err,
      });
      throw err;
    }
  },
  // DON'T change and remove stopServer
  stopServer: async function stopServer() {
    //--------------------------------------------
    // Normally you don't need to change the code inside try/catch, but you still can change it if you need
    // Based on baseRetailerService APIs(https://www.npmjs.com/package/@bitskyai/retailer-sdk) to change
    try {
      await baseRetailerService.stop();
    } catch (err) {
      throw err;
    }
  },
};
