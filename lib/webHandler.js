const express = require('express');
const redis = require('redis');
const session = require("express-session");
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();
const apiHandler = require('./apiHandler')
const passport = require('passport');
require('./passport')(passport);
const socketHandler = require('./socketHandler');
const config = require('../config.json');

module.exports = function (app, io) {
    app.use(express.urlencoded({ extended: true }));

    redisClient.on('error', (err) => {
        // TODO: handle this
        console.log('Redis error: ', err);
    });

    /*
    var room = { "slug": "DnBHeaven", "knownUsers": [], "name": "DnB Heaven", "creator": "Millibar", "desc": "This room doesn't have a description", "motd": "Welcome to my room!" }

    //redisClient.hmset("rooms", "lmao", JSON.stringify(room), "xd", "off");

    redisClient.hmset('rooms', );

    redisClient.hgetall("rooms", function (err, obj) {
        console.log(obj);
    });
    */

    const sessionMiddleware = session({
        secret: 'IHopeImDoingThisRight',
        name: '_webSessions',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
        store: new redisStore({ host: config.redisIP, port: 6379, client: redisClient, ttl: 86400 }),
    })

    app.use(sessionMiddleware);

    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api', apiHandler())

    app.get('/', (req, res) => {
        //console.log("web request: " + process.pid);
        res.sendFile(__dirname + '/index.html');
    });

    socketHandler(io, passport, sessionMiddleware)
}
