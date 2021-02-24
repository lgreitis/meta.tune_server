const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController');
const usersController = require('../controllers/usersController');

module.exports = function apiHandler(getMain){
    router.get('/rooms', passMain, roomsController.getRooms);
    router.post('/joinRoom', passMain, roomsController.joinRoom);

    router.post('/login', passMain, usersController.login);
    router.post('/signup', passMain, usersController.signup);

    function passMain (req, res, next) {
        req.getMain = getMain;
        next();
    }

    return router;
};

