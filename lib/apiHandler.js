const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const playlistController = require('../controllers/playlistController')
const roomsController = require('../controllers/roomsController')

module.exports = function apiHandler(){
    router.post('/login', usersController.login);
    router.post('/signup', usersController.signup);

    router.post('/addToPlaylist', playlistController.addToPlaylist)
    router.get('/playlist', playlistController.getPlaylist)

    router.get('/rooms', roomsController.getRooms)
    router.post('/room', roomsController.postRoom)
    router.post('/uroom', roomsController.postRoomInfo)

    return router;
};