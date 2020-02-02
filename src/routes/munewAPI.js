const axios = require("axios");
const fs = require("fs-extra");
const config = require("../utils/config");
const defaultFilePath = config.DATA_PATH;
/**
 * Send need to collect intelligences to Server Side
 * @param {array} intelligences - Array of intelligences that need send to DIA
 */
function sendToDIA(intelligences, callback) {
  let headers = {};
  if (config.DIA_SECURITY_KEY) {
    headers[config.X_SECURITY_KEY_HEADER] = config.DIA_SECURITY_KEY;
  }
  let reqConfig = {
    baseURL: config.MUNEW_BASE_URL,
    url: config.DIA_ADD_INTELLIGENCES_PATH,
    method: config.DIA_ADD_INTELLIGENCES_METHOD,
    headers: headers,
    data: intelligences
  };

  axios
    .request(reqConfig)
    .then(function(res) {
      // successful
      callback(res.data, null);
    })
    .catch(function(err) {
      callback(null, err);
    });
}

function saveToJSON(data, filepath) {
  if(!filepath){
    filepath = defaultFilePath;
  }
  fs.access(filepath, fs.F_OK, function(err) {
    let collectedArticles = [];
    if (!err) {
      collectedArticles = fs.readFileSync(filepath, "utf8");
      collectedArticles = JSON.parse(collectedArticles);
    }
    collectedArticles = collectedArticles.concat(data);
    // makre sure file exist
    fs.ensureFileSync(filepath);
    fs.writeFileSync(filepath, JSON.stringify(collectedArticles, null, 2));
  });
}

function getIntelligenceObject(url, priority, metadata, suitableAgents, permission) {
  if (!suitableAgents) {
    suitableAgents = ["BROWSEREXTENSION", "SERVICE", "HEADLESSBROWSER"];
  }
  if (!permission) {
    permission = "PUBLIC";
  }
  return {
    soi: {
      globalId: config.GLOBAL_ID
    },
    priority: priority || 100,
    metadata: metadata,
    suitableAgents: suitableAgents,
    permission: permission,
    url: url
  };
}

module.exports = {
  sendToDIA: sendToDIA,
  saveToJSON: saveToJSON,
  getIntelligenceObject: getIntelligenceObject
}