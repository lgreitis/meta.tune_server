const express = require('express');
const redis = require('redis');
const session = require("express-session");
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();
const apiHandler = require('./apiHandler')
const passport = require('passport');
require('./passport')(passport);

module.exports = function (app) {    
    app.use(express.urlencoded({ extended: true }));

    redisClient.on('error', (err) => {
        console.log('Redis error: ', err);
    });

    app.use(session({
        secret: 'IHopeImDoingThisRight',
        name: '_webSessions',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Note that the cookie-parser module is no longer needed
        store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 }),
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api', apiHandler())

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });
}
