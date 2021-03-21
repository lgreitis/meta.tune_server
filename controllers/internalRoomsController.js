/* eslint-disable no-unused-vars */
const roomUtils = require("../lib/roomUtils");

// TODO: only localhost method
exports.goToNextSong = async (req, res, next) => {
    const roomSlug = JSON.parse(Object.keys(req.body)[0]).roomSlug;
    req.io.to(roomSlug).emit("chat message", { user: "Server", text: "Song ended " + roomSlug });
    roomUtils.queuePop(roomSlug, (err, response) => {
        if (err) {
            console.log(err);
        }
        if (response.length === 0) {
            req.io.to(roomSlug).emit("chat message", { user: "Server", text: "Queue ended " + roomSlug });
            roomUtils.setNonePlaying(roomSlug, (err, res) => {
                if (err) {
                    console.log(err);
                }
            });
        }
        else if (response.length >= 0) {
            const user = JSON.parse(response[0]);
            roomUtils.setPlaying(roomSlug, user.id, (err, res) => {
                if (err) {
                    console.log(err);
                    return;
                }
                req.io.to(roomSlug).emit("now playing", res);
                req.io.to(roomSlug).emit("chat message", { user: "Server", text: "Started playing song " + res });
            });
        }
    });
};