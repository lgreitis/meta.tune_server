const Room = require("../models/Room");
const urlSlug = require('url-slug')

exports.getRooms = async (req, res, next) => {
    if (req.user) {
        Room.find()
            .then((rooms) => {
                res.status(201).json(rooms)
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else {
        res.status(401).send();
    }
}

exports.postRoom = async (req, res, next) => {
    if (req.user) {
        const { name, motd, desc } = req.body;
        const slug = urlSlug.convert(name);
        const creator = req.user;

        Room.findOne({ $or: [{ slug: slug }, { name: name }] }).then(room => {
            if (room) {
                res.status(403).send();
            } else {
                const newRoom = new Room({
                    slug,
                    name,
                    creator,
                    motd,
                    desc
                });
                newRoom.save().then((room) => {
                    res.json(newRoom)
                });
            }
        })
    }
    else {
        res.status(401).send();
    }
}