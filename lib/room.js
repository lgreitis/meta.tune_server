const logger = require('./../logger.js');
const fs = require('fs');
const path = require('path');

var Room = function (getMain, name) {
    this.name = name;
    this.getMain = getMain;
    this.slug = name;
    this.knownUsers = [];
    this.motd = 'Welcome to my room!';
    this.isPlaying = false;
    this.usersId = [];
    this.history = [];
    this.backlist = [];
    this.creator = null;
    this.votes = {};
    this.desc = 'This room doesn\'t have a description';
    this.syncTime = null;
    this.cacheUsers = {
        array: [],
        needsUpdating: true
    };
    this.cachedArray = [];
    this.playing = {
        dj: {
            user: {
                id: null
            },
            store: () => {
                return {};
            }
        },
        media: {
            cid: "XIMLoLxmTDw",
            id: 0,
            title: "Nothing Playing Right Now",
            author: "",
            length: 20,
            format: 1
        }
    };
    this.id = -1;

    this.setSyncNow();
    this.nullPlaying();
};

// TODO: rework when DB framework is created
Room.prototype.load = function () {
    var _self = this;
    var data = JSON.parse(fs.readFileSync(getPath(this.name)).toString('utf8'))

    Object.keys(data).forEach(function (attrname) {
        _self[attrname] = data[attrname];
    });

    if (this.id === -1) {
        this.id = getFiles('./rooms/').length;
        this.save();
    }

    this.nullPlaying(true);
    this.usersId = [];
}

// TODO: rework when DB framework is created
Room.prototype.save = function () {
    var _self = this;
    try {
        logger.debug('Saving room %s', _self.name);

        if (_self.id < 0)
            // TODO: add better id generation method
            _self.id = getFiles('./rooms/').length + 1000;

        fs.writeFileSync(getPath(_self.name), JSON.stringify({
            slug: _self.slug,
            knownUsers: _self.knownUsers,
            name: _self.name,
            creator: _self.creator,
            creatorId: _self.creatorId,
            sub: _self.sub,
            lore: _self.lore,
            id: _self.id,
        }));
    } catch (e) {
        logger.warn('Failed to save room! %s', this.slug)
    }
};

var getPath = function (name) {
    return './rooms/' + name + '.json'
};

function getFiles(srcpath) {
    return fs.readdirSync(srcpath).filter(function (file) {
        return (!(fs.statSync(path.join(srcpath, file)).isDirectory()))
    })
}

Room.prototype.nullPlaying = function () {
    this.isPlaying = false;
    this.playing = {
        dj: {
            user: {
                id: 3,
                username: ''
            },
            store: function () {
                return {};
            }
        },
        media: this.playing.media
    };
};

Room.prototype.setSyncNow = function () {
    this.syncTime = Date.now();
};

module.exports = Room;