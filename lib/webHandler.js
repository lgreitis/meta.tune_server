const express = require('express');
const logger = require('./../logger.js');
const socketHandler = require('./socketHandler.js');
const apiHandler = require('./apiHandler.js');
const passport = require('passport');
var session = require("express-session");
require('./passport.js')(passport);

module.exports = function (getMain) {
    const app = express();
    const http = require('http').Server(app);

    // Express body parser
    app.use(express.urlencoded({ extended: true }));

    const sessionMiddleware = session({ secret: "ihopethisisright" });
    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api', apiHandler(getMain))

    // THIS IS FOR TESTING PURPOSES ONLY DELETE THIS LATER
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    http.listen(process.env.PORT || getMain().config.port, () => {
        console.log(`Socket.IO server running at http://localhost:${process.env.PORT || getMain().config.port}/`);
    });

    new socketHandler(getMain, http, passport, sessionMiddleware);
}