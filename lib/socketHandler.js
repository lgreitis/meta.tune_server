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
            if (res) {
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
        const { slug } = socket.handshake.query;

        socket.on("skip", () => {
            // Skip only if user requesting is room creator
            // TODO: Dont let infinite skip spam... :|
            console.log("checking for admin");
            roomUtils.isRoomCreator(slug, socket.name, (err, res) => {
                console.log("is admin");
                if (err) {
                    io.to(slug).emit("chat message", { user: "Server", text: "Error occured " + err });
                }
                if (res) {
                    io.to(slug).emit("chat message", { user: "Server", text: "Song skipped by the admin." });
                    roomUtils.skipSong(slug, (err, res) => {
                        if (err) {
                            console.log(err);
                            //io.to(slug).emit("chat message", { user: "Server", text: "Error occured " + err });
                            return;
                        }
                        if (typeof res.mediaId === "string") {
                            res.new = true;
                            io.to(slug).emit("now playing", res);
                            //io.to(slug).emit("chat message", { user: "Server", text: "Started playing song " + JSON.parse(res) });
                        }
                    });
                }
            });
        });

        socket.on("join queue", (msg) => {
            console.log("lfsdlk");
            if (Number.isInteger(msg)) {
                roomUtils.isPlaying(slug, (err, res) => {
                    if (err) {
                        console.log(err);
                    }
                    // if something is playing add to queue
                    if (res == "true") {
                        const obj = {
                            name: socket.name,
                            id: socket.request.user.id,
                            index: msg
                        };

                        roomUtils.queuePush(slug, JSON.stringify(obj), (err, res) => {
                            if (err) {
                                console.log(err);
                            }
                            if (res == 1) {
                                io.to(slug).emit("chat message", { user: "Server", text: socket.name + " joined the queue" });
                            }
                        });
                    }
                    // else start playing now
                    else {
                        roomUtils.setPlaying(slug, socket.request.user.id, msg, (err, res) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            // new is used to ckeck if this is a new song or is it just continuing from some song, check below when it's false
                            res.new = true;
                            io.to(slug).emit("now playing", res);
                            //io.to(slug).emit("chat message", { user: "Server", text: "Started playing song " + JSON.stringify(res) });
                        });
                    }
                });
            }
        });

        io.to(slug).emit("chat message", { user: "Server", text: "User has joined: " + socket.name });

        // On join start playing song
        roomUtils.getPlaying(slug, (err, res) => {
            const payload = {
                mediaId: res[2],
                playingData: JSON.parse(res[0]),
                // we're continuing the song so this is false
                new: false
            };
            io.to(socket.id).emit("now playing", payload);
        });


        socket.on("chat message", msg => {
            const content = {
                user: socket.name,
                id: socket.request.user.id,
                ms_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                text: msg
            };
            io.to(slug).emit("chat message", content);
        });

        socket.on("delete message", msg => {
            roomUtils.isRoomCreator(slug, socket.name, (err, res) => {
                if (err) {
                    //io.to(slug).emit("chat message", { user: "Server", text: "Error occured " + err });
                }
                if (res) {
                    console.log("deleting...");
                    const content = {
                        ms_id: msg
                    };
                    io.to(slug).emit("delete message", content);
                }
            });
        });
    });
};