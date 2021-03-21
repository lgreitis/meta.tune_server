/* eslint-disable no-unused-vars */
const redis = require("redis");
const Room = require("../models/Room");
const User = require("../models/User");
const axios = require("axios");

const client = redis.createClient({
    port: 6379,
    host: "localhost",
});

client.on("error", (err) => {
    // TODO: handle this
    console.log("roomUtils redis server error: ", err);
});

module.exports = {
    // Import all rooms from mongoDB to Redis
    allRoomsToRedis: function () {
        Room.find()
            .populate("creator")
            .then((rooms) => {
                rooms.forEach(room => {
                    this.roomToRedis(room);
                });
            })
            .catch((err) => {
                console.log(err);
            });
    },

    roomToRedis: function (room) {
        const mainRoomData = {
            name: room.name,
            creatorName: room.creator.name,
            motd: room.motd,
            desc: room.desc
        };

        const playingData = {
            syncTime: "null",
            playingUser: "false",
            length: 0
        };

        client.hmset("room:" + room.slug, "mainRoomData", JSON.stringify(mainRoomData), "playingData", JSON.stringify(playingData), "mediaId", "false", "isPlaying", "false", (err, res) => {
            if (err) {
                console.log("Redis: error adding room: " + err);
            }
            // When room is instantiated make sure there's no queue leftover
            client.del("queue:" + room.slug, (err, res) => {
                if (err) {
                    console.log("Redis: error deleting queue: " + err);
                }
            });
        });
    },

    checkForRoom: function (roomSlug, cb) {
        client.exists("room:" + roomSlug, (err, res) => {
            // TODO: if room doesn't exist in redis, it probably exists in mongoDB
            if (err) {
                cb(new Error(err));
            }
            if (res == 1) {
                cb(true);
            }
            if (res == 0) {
                cb(false);
            }
        });
    },

    getRoom: function (roomSlug, cb) {
        client.hmget("room:" + roomSlug, "mainRoomData", "mediaId", (err, res) => {
            if (err) {
                cb(new Error(err));
            }
            cb(null, res);
        });
    },

    queuePush: function (roomSlug, username, cb) {
        client.zadd("queue:" + roomSlug, "nx", Date.now(), username, (err, res) => {
            if (err) {
                cb(new Error(err));
                return;
            }
            cb(null, res);
        });
    },

    queuePop: function (roomSlug, cb) {
        client.zpopmin("queue:" + roomSlug, (err, res) => {
            if (err) {
                cb(new Error(err));
                return;
            }
            cb(null, res);
        });
    },

    isPlaying: function (roomSlug, cb) {
        client.hget("room:" + roomSlug, "isPlaying", (err, res) => {
            if (err) {
                cb(new Error(err));
                return;
            }
            cb(null, res);
        });
    },

    getPlaying: function (roomSlug, cb) {
        client.hmget("room:" + roomSlug, "playingData", "isPlaying", "mediaId", (err, res) => {
            if (err) {
                cb(new Error(err));
            }
            cb(null, res);
        });
    },

    setPlaying: function (roomSlug, userID, cb) {
        User.findById(userID, (err, res) => {
            if (err) {
                cb(new Error(err));
                return;
            }

            const playingData = {
                syncTime: setSyncNow(),
                playingUser: res.name,
                length: res.playlist[0].length
            };

            const mediaId = res.playlist[0].yt_id;

            client.hmset("room:" + roomSlug, "playingData", JSON.stringify(playingData), "mediaId", mediaId, "isPlaying", "true", (err, res) => {
                if (err) {
                    cb(new Error(err));
                    return;
                }
                this.startTimer(roomSlug, playingData.length, (err, res) => {
                    if (err) {
                        cb(new Error(err));
                        return;
                    }
                    cb(null, mediaId);
                });
            });
        });
    },

    setNonePlaying: function (roomSlug, cb) {
        const playingData = {
            syncTime: "null",
            playingUser: "false",
            length: 0
        };

        client.hmset("room:" + roomSlug, "playingData", JSON.stringify(playingData), "mediaId", "false", "isPlaying", "false", (err, res) => {
            if (err) {
                cb(new Error(err));
                return;
            }
            cb(null, res);
        });
    },

    startTimer: function (roomSlug, time, cb) {
        const responseData = {
            "roomSlug": roomSlug
        };

        const data = {
            "timeout": time * 1000,
            "data": JSON.stringify(responseData),
            "callback": {
                "transport": "http",
                "method": "post",
                "uri": "localhost:8888/api/goToNextSong"
            }
        };

        axios.post("http://localhost:3000/timer", JSON.stringify(data)).then(function (response) {
            cb(null, true);
        }).catch((err) => {
            cb(new Error(err));
        });
    }
};

function setSyncNow() {
    return Date.now();
}