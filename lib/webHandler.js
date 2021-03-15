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

    const sessionMiddleware = session({
        secret: 'IHopeImDoingThisRight',
        name: '_webSession',
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
        res.sendFile(__dirname + '/index.html');
    });

    socketHandler(io, passport, sessionMiddleware)
}
