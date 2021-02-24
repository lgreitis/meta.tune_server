// TODO: DON'T SEND ALL THE ROOM DATA, and only send a couple of rooms.
// For testing purposes this will send all room data.
exports.getRooms = async (req, res, next) => {
    var getMain = req.getMain;

    console.log(req.user)

    if(req.user){
        res.send(getMain().rooms);
    }
    else {
        res.json({ success: false });
    }
}

exports.joinRoom = async (req, res, next) => {
    const { slug } = req.body;
    var getMain = req.getMain;

    if(req.user){
        var room = getMain().rooms.filter((obj) => {
            return obj.slug === slug;
        })[0];
        res.send(room);
    }
    else {
        res.json({ success: false });
    }
}