const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true
    },
    knownUsers: [{
        user_id: {
            type: mongoose.ObjectId,
            required: true
        },
        role: {
            type: String,
            required: true
        }
    }],
    name: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    creatorId: {
        type: mongoose.ObjectId,
        required: true
    },
    sub: {
        type: String,
        required: false
    },
    lore: {
        type: String,
        required: true
    },
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
