const _ = require("lodash");
const customConfig = require("../customConfig");
/* eslint-disable no-process-env */
// Env vars should be casted to correct types

// Get Analyst Service Configuration 
function getConfig() {
  // get config from process env
  let config = {
    MUNEW_BASE_URL: process.env.MUNEW_BASE_URL,
    DIA_SECURITY_KEY: process.env.DIA_SECURITY_KEY,
    GLOBAL_ID: process.env.GLOBAL_ID,
    PORT: Number(process.env.PORT) || 8081, // server port number
    // where to store your 
    DATA_PATH: process.env.DATA_PATH,

    // Defualt you don't need change it, only change when you know how,
    // otherwise, keep it as default
    X_SECURITY_KEY_HEADER: process.env.X_SECURITY_KEY_HEADER || "x-munew-security-key",
    DIA_ADD_INTELLIGENCES_PATH: process.env.DIA_ADD_INTELLIGENCES_PATH || "/apis/intelligences",
    DIA_ADD_INTELLIGENCES_METHOD: process.env.DIA_ADD_INTELLIGENCES_METHOD || "post"
  };

  // use 
  config = _.merge(config, customConfig);
  console.log("Analyst Service Configuration: ");
  console.log(config);

  if(!config.MUNEW_BASE_URL){
    throw new Error("You must set `MUNEW_BASE_URL` in `customConfig.js` or `process.env.GLOBAL_ID`. ");
  }

  if(!config.GLOBAL_ID){
    throw new Error('You must set `GLOBAL_ID` in `customConfig.js` or `process.env.GLOBAL_ID`. You can find detail in https://docs.munew.io/how-tos/how-to-set-an-analyst-service-global_id. ')
  }

  return config;
}

module.exports = getConfig();
