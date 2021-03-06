/* eslint-disable no-unused-vars */
const roomUtils = require("../lib/roomUtils");

// TODO: only localhost method
exports.goToNextSong = async (req, res, next) => {
    const roomSlug = JSON.parse(Object.keys(req.body)[0]).roomSlug;
    //req.io.to(roomSlug).emit("chat message", { user: "Server", text: "Song ended " + roomSlug });
    // if there are users in queue play that song
    // else just write queue ended
    roomUtils.changeSong(roomSlug, (err, res) => {
        if (err){
            console.log(err);
            req.io.to(roomSlug).emit("chat message", { user: "Server", text: "Error occured " + err });
            return;
        }
        if (res === 1){
            req.io.to(roomSlug).emit("chat message", { user: "Server", text: "Queue ended " });
        }
        else {
            res.new = true;
            req.io.to(roomSlug).emit("now playing", res);
            //req.io.to(roomSlug).emit("chat message", { user: "Server", text: "Started playing song " + JSON.stringify(res) });
        }
    });
};