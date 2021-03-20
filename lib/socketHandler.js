const roomUtils = require("./roomUtils");

module.exports = function (io, passport, sessionMiddleware) {
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    // Must be logged in
    io.use((socket, next) => {
        if (socket.request.user) {
            socket.name = socket.request.user.name;
            next();
        } else {
            //next();
            // TODO: handle this???
            next(new Error("unauthorized"));
        }
    });

    // Must be in valid room
    io.use((socket, next) => {
        const slug = socket.handshake.query.slug;
        roomUtils.checkForRoom(slug, (res) => {
            if (res){
                socket.join(slug);
                next();
            }
            else {
                // TODO: handle this???
                next(new Error("unauthorized"));
            }
        });
    });

    io.on("connection", (socket) => {
        const slug = socket.handshake.query.slug;

        socket.on("test", () => {
            // roomUtils.startTimer(slug, (err, res) => {
            //     //console.log(err);
            // });
        });

        socket.on("join queue", () => {
            roomUtils.isPlaying(slug, (res) => {
                if(res == "true"){
                    roomUtils.queuePush(slug, socket.name, () => {
                        io.to(slug).emit("join queue", socket.name);
                    });
                }
                else {
                    roomUtils.setPlaying(slug, socket.request.user.id, (err, res) => {
                        if(err){
                            console.log(err);
                            return;
                        }
                        //console.log(res);
                        io.to(slug).emit("now playing", res);
                        io.to(slug).emit("chat message", {user: "Server", text: "Started playing song " + res});
                    });
                }
            });
        });

        socket.on("chat message", msg => {
            roomUtils.queuePop(slug, (res) => {
                console.log(res);
            });
            const content = {
                user: socket.name,
                id: socket.request.user.id,
                text: msg
            };
            io.to(slug).emit("chat message", content);
        });
    });
};