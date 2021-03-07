const cluster = require("cluster");
const app = require("express")();
const http = require("http");
const { Server } = require("socket.io");
const redisAdapter = require("socket.io-redis");
const { setupWorker } = require("@socket.io/sticky");
const mongoose = require('mongoose');
const roomUtils = require('./lib/roomUtils');
const config = require('./config.json');

module.exports = function() {
    console.log(`Worker ${process.pid} started`);

    mongoose
        .connect(config.dbPassword,
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        .then(() => afterMongodbConnect())
        .catch(err => console.log("Can't connect to mongoDB on " + process.pid + ": " + err));

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        transports: ["websocket"] // HTTP long-polling is disabled
    });
    io.adapter(redisAdapter({ host: config.redisIP, port: 6379 }));
    setupWorker(io);

    require('./lib/webHandler')(app, io);
}

function afterMongodbConnect() {
    if (cluster.worker.id == 1){
        roomUtils.allRoomsToRedis();
    }
}