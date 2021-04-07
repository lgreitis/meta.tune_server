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

    // Converts mongoose room object to redis key
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

        client.hmset("room:" + room.slug, "mainRoomData", JSON.stringify(mainRoomData), "playingData", JSON.stringify(playingData), "mediaId", "false", "isPlaying", "false", "cancelTimer", "null", (err, res) => {
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

    // Check if room exists on redis if it doesn't instantiate it from mongoDB
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

    // Returns room data from redis
    getRoom: function (roomSlug, cb) {
        client.hmget("room:" + roomSlug, "mainRoomData", (err, res) => {
            if (err) {
                cb(new Error(err));
            }
            cb(null, res);
        });
    },

    // Adds user to redis queue
    queuePush: function (roomSlug, username, cb) {
        client.zadd("queue:" + roomSlug, "nx", Date.now(), username, (err, res) => {
            if (err) {
                cb(new Error(err));
                return;
            }
            cb(null, res);
        });
    },

    // Removes first user from queue
    queuePop: function (roomSlug, cb) {
        client.zpopmin("queue:" + roomSlug, (err, res) => {
            if (err) {
                cb(new Error(err));
                return;
            }
            cb(null, res);
        });
    },

    // Checks if room currently has a playing song
    isPlaying: function (roomSlug, cb) {
        client.hget("room:" + roomSlug, "isPlaying", (err, res) => {
            if (err) {
                cb(new Error(err));
                return;
            }
            cb(null, res);
        });
    },

    // Gets currently playing data
    getPlaying: function (roomSlug, cb) {
        client.hmget("room:" + roomSlug, "playingData", "isPlaying", "mediaId", (err, res) => {
            if (err) {
                cb(new Error(err));
            }
            cb(null, res);
        });
    },

    // Sets playing song from user's playlist
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

    // Resets redis key to nothing playing
    setNonePlaying: function (roomSlug, cb) {
        const playingData = {
            syncTime: "null",
            playingUser: "false",
            length: 0
        };

        client.hmset("room:" + roomSlug, "playingData", JSON.stringify(playingData), "mediaId", "false", "isPlaying", "false", "cancelTimer", "null", (err, res) => {
            if (err) {
                cb(new Error(err));
                return;
            }
            cb(null, res);
        });
    },

    // Writes cancel token to redis
    setupCancelTimer: function (roomSlug, timer, cb) {
        client.hmset("room:" + roomSlug, "cancelTimer", timer, (err, res) => {
            if (err) {
                return cb(new Error(err), null);
            }
            cb(null, res);
        });
    },

    // Starts timer via skyring
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

        axios.post("http://localhost:3000/timer", JSON.stringify(data)).then((response) => {
            this.setupCancelTimer(roomSlug, response.headers.location, (err, res) => {
                if (err) {
                    console.log(err);
                }
            });
            cb(null, true);
        }).catch((err) => {
            cb(new Error(err));
        });
    },

    // Deletes skyring timer via token
    cancelTimer: function (roomSlug, cb) {
        client.hmget("room:" + roomSlug, "cancelTimer", "isPlaying", "mediaId", (err, res) => {
            if (err) {
                cb(new Error(err));
            }
            axios.delete("http://localhost:3000" + res[0]).then((response) => {
                // TODO:
                //console.log(response);
            });
        });
    },

    // Changes song in the room
    // If res is 1 then no songs in queue
    // If it returns id then next song in queue is started
    changeSong: function (roomSlug, cb) {
        this.queuePop(roomSlug, (err, res) => {
            if (err) {
                return cb(new Error(err), null);
            }
            if (res.length === 0) {
                cb(null, 1);
                this.setNonePlaying(roomSlug, (err, res) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            else if (res.length >= 0) {
                const user = JSON.parse(res[0]);
                this.setPlaying(roomSlug, user.id, (err, res) => {
                    if (err) {
                        return cb(new Error(err), null);
                    }
                    cb(null, res);
                });
            }
        });
    },

    skipSong: function (roomSlug, cb) {
        this.cancelTimer(roomSlug);
        this.changeSong(roomSlug, (err, res) => {
            cb(err, res);
        });
    },

    isRoomCreator: function (roomSlug, name, cb) {
        this.getRoom(roomSlug, (err, res) => {
            if (err) {
                return cb(new Error(err), null);
            }
            const creatorName = JSON.parse(res[0]).creatorName;
            if (name == creatorName) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        });
    },
};

function setSyncNow() {
    return Date.now();
}