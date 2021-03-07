const redis = require('redis');
const Room = require("../models/Room");

const client = redis.createClient({
    port: 6379,
    host: 'localhost',
});

client.on('error', (err) => {
    // TODO: handle this
    console.log('roomUtils redis server error: ', err);
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
            })
    },

    roomToRedis: function (room) {
        const arr = ["name", room.name,
            "creator-name", room.creator.name,
            "motd", room.motd,
            "desc", room.desc,
            "isPlaying", "false",
            "syncTime", setSyncNow(),
            "playingUser", "false",
            "mediaId", "false",
            "title", "Nothing playing right now",
            "lenght", 0]

        client.hmset("room:" + room.slug, arr, function (err, res) {
            if(err){
                console.log(err)
            }
        });
    },

    checkForRoom: function (roomSlug, cb) {
        client.exists("room:" + roomSlug, function (err, obj) {
            // TODO: if room doesn't exist in redis, it probably exists in mongoDB
            if (err) {
                console.log(err)
            }
            if (obj == 1){
                cb(true);
            }
            if (obj == 0){
                cb(false);
            }
        });
    }
}

function setSyncNow() {
    return Date.now();
}