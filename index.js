const Framework = require('./framework.js');
const logger = require('./logger.js');
const Room = require('./lib/room.js');
const WebHandler = require('./lib/webHandler.js');
const fs = require('fs');
const mongoose = require('mongoose');


var program = {};
const main = {
    rooms: [],
    sessions: [],
    storeSync: [],
    saving: false
}
console.log(main)
program.onLaunch = (error) => {
    logger.info('Starting up.');

    loadConfiguration();
    loadRooms();

    new WebHandler(() => {
        return main;
    });
    
    mongoose
        .connect(main.config.dbPassword,
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        .then(() => logger.log('MongoDB Connected'))
        .catch(err => logger.warn(err));

    
    //console.log(main)
};

function loadConfiguration() {
    var raw = JSON.parse(fs.readFileSync('./config.json', {
        encoding: 'utf8'
    }));

    var conf = {};
    Object.keys(raw).forEach((attrname) => {
        conf[attrname] = raw[attrname];
    });

    main.config = conf;
}

// TODO: rework when DB framework is created
function loadRooms() {
    fs.readdir('./rooms/', function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            if (!(file.endsWith('.json')))
                return;
            var room = new Room(() => {
                return main;
            }, file.toString().before('.json'));

            room.load();

            main.rooms.push(room);

            logger.log('Loaded room %s', room.name);
        });
    });
};

new Framework(program, false);