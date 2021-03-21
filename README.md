# README #

This is server that is used for Meta.tune app

### Setup ###

* Install redis server `https://redislabs.com/blog/redis-on-windows-10/`
* Install Node.JS
* Download the nats binary from `https://github.com/nats-io/nats-server/releases` and start it using the defaults
* Run `npm install`
* Run `node . --channel:port=3455 --seeds='localhost:3455'` in skyring-timer folder 
* Run `npm start`, to start the server