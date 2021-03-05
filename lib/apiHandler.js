const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const playlistController = require('../controllers/playlistController')

module.exports = function apiHandler(){
    router.post('/login', usersController.login);
    router.post('/signup', usersController.signup);

    router.post('/addToPlaylist', playlistController.addToPlaylist)
    router.get('/playlist', playlistController.getPlaylist)

    return router;
};