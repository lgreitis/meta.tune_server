const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const playlistController = require("../controllers/playlistController");
const roomsController = require("../controllers/roomsController");
const internalRoomsController = require("../controllers/internalRoomsController");
const multer = require("multer");

var upload = multer({ dest: 'uploads/' });

module.exports = function apiHandler(io) {
    router.get("/isloggedin", usersController.isloggedin);
    router.post("/login", usersController.login);
    router.post("/signup", usersController.signup);
    router.post("/photo", upload.single('avatar'), usersController.changePhoto);
    router.get("/image/:w", usersController.getImage);

    router.post("/addToPlaylist", playlistController.addToPlaylist);
    router.get("/playlist", playlistController.getPlaylist);

    router.get("/rooms", roomsController.getRooms);
    router.post("/room", roomsController.postRoom);
    router.post("/uroom", roomsController.postRoomInfo);

    router.post("/goToNextSong", passIo, internalRoomsController.goToNextSong);

    // eslint-disable-next-line no-unused-vars
    function passIo(req, res, next) {
        req.io = io;
        next();
    }

    return router;
};