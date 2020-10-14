## Hello Retailer Service
Most of time you should only need to work on `worker.js`. `server.js` should already be fully configured, only change if you need. 
For more information, please take a look [@bitskyai/retailer-sdk](https://github.com/bitskyai/bitsky-retailer-sdk)

## Docker

### Use default configurations

```
docker run -p 8081:8081 \
           -e BITSKY_BASE_URL=http://10.0.0.247:9099 \
           -e GLOBAL_ID=32e9671f-8f3c-45ac-8dfe-d5b5d9a0cbc1 \
           bitskyai/hello-retailer
```

## Heroku

You can simply deploy this app to Heroku by click this button:
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)