const roomUtils = require('./roomUtils');

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
            //next();
            // TODO: handle this???
            next(new Error('unauthorized'))
        }
    });

    io.on("connection", (socket) => {
        const slug = socket.handshake.query.slug
        let correctRoom = false;

        roomUtils.checkForRoom(slug, (res) => {
            if (res){
                correctRoom = true;
                socket.join(slug);
            }
            else {
                socket.disconnect();
            }
        });

        socket.on('chat message', msg => {
            if(correctRoom){
                io.to(slug).emit('chat message', socket.name + ": " + msg);
            }
        });
    });
}