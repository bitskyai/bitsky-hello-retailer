const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const router = express.Router();
const config = require("../config");
const filepath = config.DATA_PATH;

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
    baseURL: config.DIA_BASE_URL,
    url: config.DIA_ADD_INTELLIGENCES_PATH,
    method: config.DIA_ADD_INTELLIGENCES_METHOD,
    headers: headers,
    data: intelligences
  };

  axios
    .request(reqConfig)
    .then(function(res) {
      // successful
      callback(res.data);
    })
    .catch(function(err) {
      callback(err);
    });
}

function saveToJSON(data) {
  fs.access(filepath, fs.F_OK, function(err) {
    let collectedArticles = [];
    if (!err) {
      collectedArticles = fs.readFileSync(filepath, "utf8");
      collectedArticles = JSON.parse(collectedArticles);
    }
    collectedArticles = collectedArticles.concat(data);
    fs.writeFileSync(filepath, JSON.stringify(collectedArticles, null, 2));
  });
}

function intelligence(url, priority, metadata, suitableAgents, permission) {
  if (!suitableAgents) {
    suitableAgents = ["BROWSEREXTENSION", "SERVICE", "HEADLESSBROWSER"];
  }
  if (!permission) {
    permission = "PUBLIC";
  }
  return {
    soi: {
      globalId: config.SOI_GLOBAL_ID
    },
    priority: priority || 100,
    metadata: metadata,
    suitableAgents: suitableAgents,
    permission: permission,
    url: url
  };
}

/* GET users listing. */
router.post("/", function(req, res) {
  // Agent collected Intelligences
  let collectedIntelligences = req.body;
  // Intelligences that need collected by Agent
  let needCollectIntelligences = [];
  // Collected
  let collectedData = [];

  for (let i = 0; i < collectedIntelligences.length; i++) {
    let item = collectedIntelligences[i];
    let data = item.dataset.data.content;
    // You can find how to use cheerio from https://cheerio.js.org/
    // cheerio: Fast, flexible & lean implementation of core jQuery designed specifically for the server.
    let $ = cheerio.load(data);

    /*
    fucntion intelligence(url, priority, metadata, suitableAgents, permission) will return an intelligence object
    */
    // Add you logic to process collect data
    // Following is an example of crawl articles from "http://exampleblog.munew.io/"
    /* 
    let targetBaseURL = "http://exampleblog.munew.io/";
    if (item.metadata.type == "bloglist") {
      // get all blogs url in blog list page
      let blogUrls = $("div.post-preview a");
      for (let i = 0; i < blogUrls.length; i++) {
        let $blog = blogUrls[i];
        $blog = $($blog);
        let url = new URL($blog.attr("href"), targetBaseURL).toString();
        needCollectIntelligences.push(
          intelligence(url, 2, {
            type: "blog"
          })
        );
      }
      let nextUrl = $("ul.pager li.next a").attr("href");
      if (nextUrl) {
        nextUrl = new URL(nextUrl, targetBaseURL).toString();
        needCollectIntelligences.push(
          intelligence(nextUrl, 1, {
            type: "bloglist"
          })
        );
      }
    } else if (item.metadata.type == "blog") {
      collectedData.push({
        title: $("div.post-heading h1").text(),
        author: $("div.post-heading p.meta span.author").text(),
        date: $("div.post-heading p.meta span.date").text(),
        content: $("div.post-container div.post-content").text(),
        url: item.dataset.url
      });
    } else {
      console.error("unknown type");
    }
    */
  }

  // Send intelligences back to DIA
  if (needCollectIntelligences.length) {
    sendToDIA(needCollectIntelligences, function(result) {
      console.log("needCollectIntelligences result: ", result);
    });
  }

  // Save collect data to JSON file
  if (collectedData.length) {
    saveToJSON(collectedData);
  }

  // response back 200
  res.status(200).end();
});

router.post("/init", function(req, res, next) {
  fs.access(filepath, fs.F_OK, function(err) {
    if (!err) {
      fs.unlinkSync(filepath);
    }
  });

  let needCollectIntelligences = [];

  // Add you initial intelligences
  // Following is an init intelligence for crawl articls from "http://exampleblog.munew.io/"
  /*
  let targetBaseURL = "http://exampleblog.munew.io/";
  needCollectIntelligences.push(
    intelligence(targetBaseURL, 1, {
      type: "bloglist"
    })
  );
  */

  if (needCollectIntelligences.length) {
    sendToDIA(needCollectIntelligences, function(result) {
      res.json(result);
    });
  }else{
    // No intelligences created
    res.json([]);
  }
});

module.exports = router;
