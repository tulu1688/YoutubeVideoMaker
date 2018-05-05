var express = require('express'),
    router = express.Router();

var dal = require('../dal.js');

router.get('/videos', function (req, res, next) {
    res.render('videos');
});

router.get('/videos/:videoId', function (req, res, next) {
    dal.searchVideos({
        id: req.params.videoId
    }, function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.send('General error');
        } else {
            var video = data.shift()
            if (video) {
                res.render('video_detail', {video: video});
            } else {
                res.statusCode = 404;
                res.send('Video with [' + req.params.videoId + '] id doesnot exist');
            }
        }
    });
});

module.exports = router;