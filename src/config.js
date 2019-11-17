const path = require("path");
let filepath = path.join(__dirname, "./public/data.json");
/* eslint-disable no-process-env */
// Env vars should be casted to correct types
const config = {
  DIA_BASE_URL: process.env.DIA_BASE_URL || "http://localhost:9099",
  DIA_SECURITY_KEY: process.env.DIA_SECURITY_KEY,
  SOI_GLOBAL_ID:
    process.env.SOI_GLOBAL_ID ||
    "c29pOjoxNTczOTQyOTY2MTMyOjo4YmMyZDZhZi02MzJlLTQzMDUtOWYzNS1kZWExYzk5MTFhZTc=",
  PORT: Number(process.env.PORT) || 8081, // server port number
  // Defualt you don't need change it, only change when you know how,
  // otherwise, keep it as default
  X_SECURITY_KEY_HEADER:
    process.env.X_SECURITY_KEY_HEADER || "x-munew-security-key",
  DIA_ADD_INTELLIGENCES_PATH:
    process.env.DIA_ADD_INTELLIGENCES_PATH || "/apis/intelligences",
  DIA_ADD_INTELLIGENCES_METHOD:
    process.env.DIA_ADD_INTELLIGENCES_METHOD || "post",
  DATA_PATH: process.env.DATA_PATH || filepath
};

module.exports = config;
