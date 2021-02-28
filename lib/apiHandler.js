const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController');
const usersController = require('../controllers/usersController');
const playlistController = require('../controllers/playlistController');

module.exports = function apiHandler(getMain){
    router.get('/rooms', passMain, roomsController.getRooms);

    router.post('/login', passMain, usersController.login);
    router.post('/signup', passMain, usersController.signup);

    router.post('/addToPlaylist', passMain, playlistController.addToPlaylist)
    router.get('/playlist', passMain, playlistController.getPlaylist)

    function passMain (req, res, next) {
        req.getMain = getMain;
        next();
    }

    return router;
};

