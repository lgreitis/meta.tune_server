const cluster = require("cluster");
const http = require("http");
const { setupMaster } = require("@socket.io/sticky");
// eslint-disable-next-line no-unused-vars
const numCPUs = require("os").cpus().length;
const config = require("./config.json");

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
    require("./worker")();
}