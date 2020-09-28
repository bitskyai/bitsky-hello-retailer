const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs-extra");

/**
 * Create a winston logger. https://github.com/winstonjs/winston
 * @param {string} logLevel - Default is `info`. Winston log level ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']. https://github.com/winstonjs/winston#logging
 * @param {string} logFilePath - Path to log file folder. Default to `public/log`
 * @param {string} errorLogFileName - File name for error logs. Default `error.log`
 * @param {*} combinedLogFileName - File name for combined logs. Default `combined.log`
 * @param {*} serviceName - Service Name. Default `name` inside `package.json`
 * @param {*} nodeEnv - NodeJS Mode. Default `development`. You also can set to `production`
 *
 * @returns {object} - winston logger
 */
function createMyLogger(
  logLevel,
  logFilePath,
  errorLogFileName,
  combinedLogFileName,
  serviceName,
  nodeEnv
) {
  try {
    if (!logFilePath) {
      logFilePath = process.env.RETAILER_LOG_FILE_PATH || path.join(__dirname, "../public/log");
    }

    fs.ensureDirSync(logFilePath);
    // console.log('[createLogger] starting...');
    const __logger = createLogger({
      level: logLevel || process.env.RETAILER_LOG_LEVEL || "debug",
      format: format.combine(
        format.ms(),
        format.errors({ stack: true }),
        format.timestamp(),
        format.splat(),
        format.json()
      ),
      defaultMeta: {
        service: serviceName || process.env.RETAILER_SERVICE_NAME || "hello-retailer-service",
      },
      transports: [
        // new transports.File({
        //   filename: path.join(
        //     logFilePath,
        //     errorLogFileName || process.env.RETAILER_ERROR_LOG_FILE_NAME || "error.log"
        //   ),
        //   level: "error",
        // }),
        new transports.File({
          filename: path.join(
            logFilePath,
            combinedLogFileName || process.env.RETAILER_COMBINED_LOG_FILE_NAME || "retailer.log"
          ),
        }),
      ],
    });
    //
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    if (nodeEnv !== "production") {
      __logger.add(
        new transports.Console({
          colorize: nodeEnv !== "production",
          timestamp: true,
        })
      );
    }

    // console.log('[createLogger] end');
    return __logger;
  } catch (err) {
    console.error("error: ", err);
    return console;
  }
}

module.exports = createMyLogger();
