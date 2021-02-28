// TODO: DON'T SEND ALL THE ROOM DATA, and only send a couple of rooms.
// For testing purposes this will send all room data.
exports.getRooms = async (req, res, next) => {
    var getMain = req.getMain;

    if(req.user){
        let payload = [];
        getMain().rooms.forEach(element => {
            payload.push(element.getSafePayload());
        });
        res.json(payload);
    }
    else {
        res.status(401).send();
    }
}