/* eslint-disable no-unused-vars */
const YouTube = require("ytube-api");
const ytDuration = require("youtube-duration");

const youTube = new YouTube();

youTube.setKey("AIzaSyAZimHw63AQ7vVUpKS1WKQgzfniXzfVyrk");

exports.addToPlaylist = async (req, res, next) => {
    const { id } = req.body;

    if (req.user) {
        // TODO: find out what's the quota of youtube api
        youTube.getById(id, function (err, response) {
            if (!err) {
                if (ytDuration.toSecond(response.items[0].contentDetails.duration) <= 600 && response.items[0].contentDetails.contentRating.ytRating == undefined) {
                    req.user.updateOne(
                        // { $pop: {playlist: 1}},
                        { $push: { playlist: [{ yt_id: id, title: response.items[0].snippet.title, length: ytDuration.toSecond(response.items[0].contentDetails.duration) }] } },
                        function (err, result) {
                            if (err) {
                                console.log(err);
                                res.status(500).send();
                            }
                            else {
                                res.status(201).json({ yt_id: id, title: response.items[0].snippet.title });
                            }
                        }
                    );
                }
                else {
                    res.status(500).send();
                }
            }
            else {
                res.status(500).send();
            }
        });
    }
    else {
        res.status(401).send();
    }
};

exports.getPlaylist = async (req, res, next) => {
    if (req.user) {
        res.json(req.user.playlist);
    }
    else {
        res.status(401).send();
    }
};

exports.deletePlaylist = async (req, res, next) => {
    if (req.user) {
        res.status(404).send();
    }
    else {
        res.status(401).send();
    }
};

exports.deleteFromPlaylist = async (req, res, next) => {
    if(req.user){
        const {id} = req.body;
        const index = "playlist." + (id - 1);
        const $unset_query = {};
        $unset_query[index] = 1;

        req.user.updateOne({$unset : $unset_query}, (err, res) => {
            console.log(res);
            console.log(err);
        });
        req.user.updateOne({$pull : {"playlist" : null}}, (err, res) => {
            console.log(res);
            console.log(err);
        });
        res.send();
    }
    else{
        res.status(401).send();
    }
};