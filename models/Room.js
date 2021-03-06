const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true
    },
    knownUsers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    motd: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
