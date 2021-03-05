const passport = require('./passport.js');

module.exports = function (io, passport, sessionMiddleware) {
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    // Must be logged in
    io.use((socket, next) => {
        if (socket.request.user) {
            socket.name = socket.request.user.name
            next();
        } else {
            // TODO: handle this???
            next(new Error('unauthorized'))
        }
    });

    io.on("connection", (socket) => {
        //console.log("connected on:" + process.pid)
        socket.on('chat message', msg => {
            //console.log("message on:" + process.pid)
            io.emit('chat message', socket.name + ": " + msg);
        });
    });
}