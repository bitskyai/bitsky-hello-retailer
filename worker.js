// https://apis.bitsky.ai/bitsky-retailer-sdk/BaseRetailerService.html
const baseRetailerService = require("@bitskyai/retailer-sdk");
//--------------------------------------------------------------
// Following are frequently use packages you possible need
// All the list packages are already pre-installed
//
// Available Packages:
// 1. https://docs.bitsky.ai/user-manual/retailer-editor/node-modules-full-list
// 2. https://nodejs.org/dist/latest-v12.x/docs/api/
//--------------------------------------------------------------
const path = require("path");
// `cheerio`: Fast, flexible & lean implementation of core jQuery designed specifically for the server
// https://www.npmjs.com/package/cheerio
const cheerio = require("cheerio");
// DOM 3 XPath 1.0 implemention and helper for JavaScript, with node.js support.
// https://www.npmjs.com/package/xpath
const xpath = require('xpath');
// `lodash`: A modern JavaScript utility library delivering modularity, performance & extras
// https://lodash.com/
const _ = require("lodash");
// `moment`: Parse, validate, manipulate, and display dates and times in JavaScript
// https://momentjs.com/
const moment = require("moment");
// `fs-extra`: adds file system methods that aren't included in the native `fs` module and adds promise support to the `fs` methods
// https://www.npmjs.com/package/fs-extra
const fs = require("fs-extra");
// `uuid`: Generate RFC-compliant UUIDs in JavaScript
// https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");
// `xlsx`: Parser and writer for various spreadsheet formats
// https://www.npmjs.com/package/xlsx
const XLSX = require("xlsx");
// `papaparse`: The powerful, in-browser CSV parser for big boys and girls
// https://www.papaparse.com/
const Papa = require("papaparse");
// `txt-file-to-json`: Reads a text file or data variable having a table and returns an array of obects
// https://www.npmjs.com/package/txt-file-to-json
const txtToJSON = require("txt-file-to-json");

// winston logger - https://www.npmjs.com/package/winston. It is useful for you to debug
// log file path: public/log/retailer.log
// Examples:
// logger.info('Hello again distributed logs');
// logger.error('Hello again distributed logs', {error: err});
const logger = require('./utils/logger');

// Check full configuration - https://apis.bitsky.ai/bitsky-retailer-sdk/global.html#Configurations
const settings = {
  SERVICE_NAME: "hello-retailer-service",
  BITSKY_BASE_URL: "http://localhost:9099",
  // You MUST change to correct Retailer Configuration Global ID
  // https://docs.bitsky.ai/how-tos/how-to-get-global-id#get-a-retailer-configuration-global-id
  GLOBAL_ID: process.env.GLOBAL_ID || "6e56474d-0c75-4125-b5a8-27b0ccf71390",
  // CONNECTOR_TYPE: "mongodb",   // Save data to mongoDB
  // MONGODB_URL: "mongodb://localhost:27017/helloretailer", // MongoDB URL
};

// Page will wait 5 second, this is to show you how to execute JavaScript inside page
// For more infomation, please take a look of `metadata.scripts` in https://apis.bitsky.ai/bitsky-retailer-sdk/global.html#Task
async function customFunction() {
  await $$page.waitFor(5 * 1000);
}

//========================================================================
// You can read https://docs.bitsky.ai/tutorials/crawl-example-blog to get detail understand what is the requirement of this example
//========================================================================

/**
 * Trigger is used for init first task/tasks for your data scrawling job. 
 * **Supplier** based on Task information to decide when to assign it to suitable **Producer** to exectue.
 * After **Producer** successfully execute Task, will send Task back to **parse** function.
 * It is the **enter point**, similar to the `main` function in Java, C/C++
 * For more information, please take a look of https://apis.bitsky.ai/bitsky-retailer-sdk/BaseRetailerService.html#trigger
 * 
 * @returns {object} - A JSON object has tasks property. Normally you can use `baseRetailerService.generateTask` to generate Task.
 *                     Detail information: https://apis.bitsky.ai/bitsky-retailer-sdk/global.html#TriggerFunReturn
 */
const trigger = async function trigger({ req, res }) {
  return {
    tasks: [
      // API: https://apis.bitsky.ai/bitsky-retailer-sdk/BaseRetailerService.html#generateTask
      baseRetailerService.generateTask({
        // Target website URL
        url: "http://exampleblog.bitsky.ai/",
        // Priority of this task. This is useful if your tasks need to be executed by order. `1` is highest priority
        priority: 1,
        // Additional metadata for this task, you should add it based your requirement. `script` is preserved, it only used for pass JavaScript Code String
        // In this example, I use `type` to distinguish different page - `bloglist` or `blog`. 
        // If it is `bloglist` then get all blog links and add new tasks to continues crawl those blogs, otherwise save blog to JSON
        // 
        // In this example, I let page to wait 5 second, this isn't necessary, only used for show you how to execute JavaScript Code. 
        // `script` is useful to crawl single page application or you need to interact with page. And only `Headless Producer` can execute tasks have script
        // `script` is the JavaScript Code you want to execute, you need to convert your function to string. Normally you can use `functionName.toString()`
        metadata: { type: "bloglist", script: customFunction.toString() },
      }),
    ],
  };
};

/**
 * After **Producer** successfully execute Task, parse function will be called. And receive the **Task** contains crawled data.
 * Parse is used for extract data and decide whether contine to add more tasks.
 * 
 * For example, in **trigger** we create a task to crawl http://exampleblog.bitsky.ai/, after **Producer** crawled successful, will send back Task that contains the HTML of http://exampleblog.bitsky.ai/
 * And inside **parse** function, we parse return HTML, and get URL link of each blog, and create tasks to continue crawl each blog
 * 
 * @returns {object} - https://apis.bitsky.ai/bitsky-retailer-sdk/global.html#ParseFunReturn
 */
const parse = async function parse({ req, res }) {
  try {
    // Task return from Producer, Task Schema - https://github.com/bitskyai/bitsky-supplier/blob/develop/src/schemas/task.json
    // By default, crawled HTML was stored in task.dataset.data.content
    const returnTasks = req.body;
    // New Tasks that need to be sent to BitSky Supplier
    const tasks = [];
    // Crawled Data, by default will be stored in local disk
    const storeData = [];
    // Base URL for the new Task
    const targetBaseURL = "http://exampleblog.bitsky.ai/";
    for (let i = 0; i < returnTasks.length; i++) {
      let task = returnTasks[i];
      // Crawled HTML - https://github.com/bitskyai/bitsky-supplier/blob/develop/src/schemas/task.json
      let htmlString = task.dataset.data.content;

      // You can find how to use cheerio from https://cheerio.js.org/
      // cheerio: Fast, flexible & lean implementation of core jQuery designed specifically for the server.
      // if you like you also can try to use `xpath`, please check https://www.npmjs.com/package/xpath
      let $ = cheerio.load(htmlString);

      if (task.metadata.type == "bloglist") {
        // If task type is **bloglist**, then need to get blog link 
        // Get more detail from https://docs.bitsky.ai/tutorials/crawl-example-blog#crawl-each-blog-list-page-and-get-blogs-link
        let blogUrls = $("div.post-preview a");
        for (let i = 0; i < blogUrls.length; i++) {
          let $blog = blogUrls[i];
          $blog = $($blog);
          // Get blog page link, don't forget to add Base URL
          let url = new URL($blog.attr("href"), targetBaseURL).toString();
          // you can use `logger.info`, `logger.error` for debug
          // please check https://www.npmjs.com/package/winston for detail
          logger.info(`blog page link: ${url}`);
          // Add Task to crawl blog page
          tasks.push(
            baseRetailerService.generateTask({
              url,
              // Set `priority` to `2`, so we can first crawl all blog list page, then crawl all blogs
              priority: 2,
              metadata: {
                // Add `type: "blog"` to indicate this task is for crawl blog
                type: "blog",
              },
            })
          );
        }
        // Get next blog list page link
        let nextUrl = $("ul.pager li.next a").attr("href");
        if (nextUrl) {
          nextUrl = new URL(nextUrl, targetBaseURL).toString();
          logger.info(`blog list page link: ${nextUrl}`);
          // If it has next blog list page, then create a Task to crawl Next Blog List page
          tasks.push(
            baseRetailerService.generateTask({
              url: nextUrl,
              // blog list page is highest priority
              priority: 1,
              metadata: {
                // indicate this task is for crawl blog list page
                type: "bloglist",
                // Just to show you how to execute JavaScript in the browser
                script: customFunction.toString(),
              },
            })
          );
        }
      } else if (task.metadata.type == "blog") {
        // If it is blog page, then crawl data and put to 
        storeData.push({
          title: $("div.post-heading h1").text(),
          author: $("div.post-heading p.meta span.author").text(),
          date: $("div.post-heading p.meta span.date").text(),
          content: $("div.post-container div.post-content").text(),
          url: task.dataset.url,
        });
      } else {
        logger.error("unknown type");
      }
    }

    // return data that need to store and tasks need to be executed
    // Check https://apis.bitsky.ai/bitsky-retailer-sdk/global.html#ParseFunReturn for more detail
    return {
      data: storeData,
      tasks: tasks,
    };
  } catch (err) {
    logger.error(`parse error: ${err.message}`);
  }
};

module.exports = {
  settings,
  trigger,
  parse,
};
