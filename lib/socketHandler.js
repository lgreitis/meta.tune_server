const logger = require('../logger.js');

module.exports = function (getMain, http, passport, sessionMiddleware) {
    const io = require('socket.io')(http);

    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    // Must be logged in
    io.use((socket, next) => {
        if (socket.request.user) {
            next();
        } else {
            // TODO: handle this???
            next(new Error('unauthorized'))
        }
    });

    // This will be used elsewhere
    getMain().io = io;

    io.on('connection', (socket) => {
        const slug = socket.handshake.query.slug

        var room = getMain().rooms.filter((obj) => {
            return obj.slug === slug;
        })[0];

        if (room) {
            socket.join(room.slug);
            room.addUser(socket.request.user)
        }
        else {
            // Incorrect room
            socket.disconnect();
        }

        socket.on('get playlist', function () {
            console.log(room.userGetPlaylist(socket.request.user));
        });

        socket.on('join queue', function () {
            room.addUserToQueue(socket.request.user);
        });

        socket.on('chat message', msg => {
            io.to(room.slug).emit('chat message', socket.request.user.name + ": " + msg);
        });
    });
}