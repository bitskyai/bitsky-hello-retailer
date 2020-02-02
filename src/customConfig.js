const path = require("path");
const homedir = require('os').homedir();
const dataPath = path.join(homedir, "./Downloads/muew_default_as_data.json");

const CUSTOM_CONFIG = {
  // You must set this value. Following is the steps to get `GLOBAL_ID`
  // 1. If you didn't register `Analyst Service`, register first
  // 2. After registered, open the `Analyst Service`, in the open drawer, copy `GLOBAL_ID`
  // 3. Pasted `Analyst Serverice GLOBAL_ID`
  GLOBAL_ID: undefined,
  // Munew Server base URL. Most of case you don't need to chanage it, in case your 9099 port it was used
  // So you should check whether MUNEW base url is `http://localhost:9099`
  // How to get MUNEW base url:
  // 1. Click `Munew Logo` in main page. It will open url in your browser, that port is currently `MUNEW` server's port
  MUNEW_BASE_URL: "http://localhost:9099",
  // where to store collect data, normally it will store in your download folder
  // if you want to change, you MUST set absolute path.
  DATA_PATH: dataPath
}

module.exports = CUSTOM_CONFIG;
