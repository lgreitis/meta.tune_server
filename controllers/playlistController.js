const getYoutubeTitle = require('get-youtube-title')
const logger = require('../logger.js');

exports.addToPlaylist = async (req, res, next) => {
    const { id } = req.body;

    if (req.user) {
        // TODO: find out what's the quota of youtube api
        getYoutubeTitle(id, "AIzaSyAZimHw63AQ7vVUpKS1WKQgzfniXzfVyrk", function (err, title) {
            if(!err){
                req.user.updateOne(
                    { $push: { playlist: [{ yt_id: id, title: title }] } },
                    function (err, result) {
                        if (err) {
                            logger.warn(err)
                            res.status(500).send();
                        }
                        else {
                            res.status(201).json({ yt_id: id, title: title });
                        }
                    }
                );
            }
            else {
                res.status(500).send();
            }
        })
    }
    else {
        res.status(401).send();
    }
}

exports.getPlaylist = async (req, res, next) => {
    if (req.user) {
        res.json(req.user.playlist);
    }
    else {
        res.status(401).send();
    }
}

exports.deletePlaylist = async (req, res, next) => {
    if (req.user) {
        res.status(404).send();
    }
    else {
        res.status(401).send();
    }
}