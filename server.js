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
  startServer: async function startServer() {
    //--------------------------------------------
    // Normally you don't need to change the code inside try/catch, but you still can change it if you need
    // Based on baseRetailerService APIs(https://www.npmjs.com/package/@bitskyai/retailer-sdk) to change
    try {
      // environment variable will overwrite settings
      const mergedSettings = _.merge({
        SERVICE_NAME: "hello-retailer-service",
        LOG_FILES_PATH: path.join(__dirname, "./public/log"),
        DATA_PATH: path.join(__dirname, "./public/data.json"),
      }, settings);
      baseRetailerService.setConfigs(mergedSettings);
      baseRetailerService.init();
      baseRetailerService.trigger(trigger);
      baseRetailerService.parse(parse);
      baseRetailerService.express({
        statics: path.join(__dirname, "./public"),
      });
      baseRetailerService.routers();
      await baseRetailerService.listen();
    } catch (err) {
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
      baseRetailerService = undefined;
    } catch (err) {
      throw err;
    }
  },
};
