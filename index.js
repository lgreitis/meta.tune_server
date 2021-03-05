const app = require("express")();
const cluster = require("cluster");
const http = require("http");
const { Server } = require("socket.io");
const redisAdapter = require("socket.io-redis");

const numCPUs = require("os").cpus().length;
const { setupMaster, setupWorker } = require("@socket.io/sticky");

const config = require('./config.json');

const mongoose = require('mongoose');
const webHandler = require('./lib/webHandler')

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    const httpServer = http.createServer();
    setupMaster(httpServer, {
        loadBalancingMethod: "random", // either "random", "round-robin" or "least-connection"
    });
    httpServer.listen(process.env.PORT || config.port);

    for (let i = 0; i < 4; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        //cluster.fork();
    });
} else {
    console.log(`Worker ${process.pid} started`);

    mongoose
        .connect(config.dbPassword,
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.log(err));

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        transports: ["websocket"] // HTTP long-polling is disabled
    });
    io.adapter(redisAdapter({ host: "localhost", port: 6379 }));
    setupWorker(io);

    webHandler(app, io);
}