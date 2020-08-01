const baseRetailerService = require("bitspider-retailer-sdk");
//--------------------------------------------------------------
// Following are some useful packages you maybe need when you are parse data
// All the list packages are already pre-installed
//--------------------------------------------------------------
const path = require('path');
// `cheerio`: Fast, flexible & lean implementation of core jQuery designed specifically for the server
// https://www.npmjs.com/package/cheerio
const cheerio = require("cheerio");
// `lodash`: A modern JavaScript utility library delivering modularity, performance & extras
// https://lodash.com/
const _ = require("lodash");
// `moment`: Parse, validate, manipulate, and display dates and times in JavaScript
// https://momentjs.com/
const moment = require("moment");
// `fs-extra`: adds file system methods that aren't included in the native `fs` module and adds promise support to the `fs` methods
// https://www.npmjs.com/package/fs-extra
const fs = require('fs-extra');
// `uuid`: Generate RFC-compliant UUIDs in JavaScript
// https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require('uuid');
// `xlsx`: Parser and writer for various spreadsheet formats
// https://www.npmjs.com/package/xlsx
const XLSX = require('xlsx');
// `papaparse`: The powerful, in-browser CSV parser for big boys and girls
// https://www.papaparse.com/
const Papa = require('papaparse');
// `txt-file-to-json`: Reads a text file or data variable having a table and returns an array of obects
// https://www.npmjs.com/package/txt-file-to-json
const txtToJSON = require("txt-file-to-json");

// You MUST change to your value
const settings = {
  GLOBAL_ID: "c29pOjoxNTkyNzk1NTI1NjAzOjpmZmFkNTI4Zi02NzYyLTRlNmQtOGQyYS05Njk1NzM0YjhkM2Q=",
  MUNEW_BASE_URL: "http://localhost:9099",
};

// To show your how to use metadata.script
// For more infomation, please take a look of bitspider-retailer-sdk API doc, download from https://github.com/munew/bitspider-retailer-sdk/releases.
async function additionalWait() {
  await $$page.waitFor(5 * 1000);
}

// Please implement your trigger function
const trigger = async function trigger({ req, res }){
  return {
    tasks: [
      baseRetailerService.generateTask({
        url: "http://exampleblog.munew.io/",
        priority: 1,
        metadata: { type: "bloglist", script: additionalWait.toString() },
      }),
    ],
  };
}

// Please implement your parse function
const parse = async function parse({ req, res }){
  try {
    // data return from Agent
    const body = req.body;
    // Add more Tasks
    const tasks = [];
    // Data store to disk
    const storeData = [];
    const targetBaseURL = "http://exampleblog.munew.io/";
    for (let i = 0; i < body.length; i++) {
      let item = body[i];
      // req.body - https://docs.munew.io/api/munew-engine-restful-api#request-body-array-item-schema
      let data = item.dataset.data.content;

      // You can find how to use cheerio from https://cheerio.js.org/
      // cheerio: Fast, flexible & lean implementation of core jQuery designed specifically for the server.
      let $ = cheerio.load(data);

      if (item.metadata.type == "bloglist") {
        // get all blogs url in blog list page
        let blogUrls = $("div.post-preview a");
        for (let i = 0; i < blogUrls.length; i++) {
          let $blog = blogUrls[i];
          $blog = $($blog);
          let url = new URL($blog.attr("href"), targetBaseURL).toString();
          tasks.push(
            baseRetailerService.generateTask({
              url,
              priority: 2,
              metadata: {
                type: "blog",
              },
            })
          );
        }
        let nextUrl = $("ul.pager li.next a").attr("href");
        if (nextUrl) {
          nextUrl = new URL(nextUrl, targetBaseURL).toString();
          tasks.push(
            baseRetailerService.generateTask({
              url: nextUrl,
              priority: 2,
              metadata: {
                type: "bloglist",
                script: additionalWait.toString()
              },
            })
          );
        }
      } else if (item.metadata.type == "blog") {
        storeData.push({
          title: $("div.post-heading h1").text(),
          author: $("div.post-heading p.meta span.author").text(),
          date: $("div.post-heading p.meta span.date").text(),
          content: $("div.post-container div.post-content").text(),
          url: item.dataset.url,
        });
      } else {
        console.error("unknown type");
      }
    }
    return {
      data: storeData,
      tasks: tasks,
    };
  } catch (err) {
    console.log(`parse error: ${err.message}`);
  }
}

module.exports = {
  settings,
  trigger,
  parse
}
