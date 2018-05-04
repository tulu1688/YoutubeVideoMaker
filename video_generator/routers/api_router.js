var express = require('express'),
    config = require('config'),
    sprintf = require('sprintf').sprintf,
    fs = require('fs'),
    fs_extra = require('fs-extra'),
    cp = require('child_process'),
    router = express.Router();

var dal = require('../dal.js');

var preRenderDir = config.get('path.imagePath.preRender');
var videoDir = config.get('path.videoPath');

dal.connectDb(
    config.get('dbConfig.host'),
    config.get('dbConfig.user'),
    config.get('dbConfig.password'),
    config.get('dbConfig.dbName')
);

router.post('/add-frame', function (req, res) {
    var data = req.body.png.replace(/^data:image\/png;base64,/, "");
    var filename = sprintf('image-%010d.png', parseInt(req.body.frame));
    var outDir = sprintf('%s/%s', preRenderDir, req.body.video_id);

    fs_extra.ensureDirSync(outDir);

    fs.writeFileSync(sprintf('%s/%s', outDir, filename), data, 'base64');

    res.end();
    process.stdout.write(sprintf('Recieved frame %s\r', req.body.frame));
});


router.post('/render', function (req, res) {
    var imgDir = sprintf('%s/%s', preRenderDir, req.body.filename);
    var fullFilePath = sprintf('%s/%s.mp4', videoDir, req.body.filename);

    fs_extra.ensureDirSync(videoDir);
    fs_extra.removeSync(fullFilePath);

    console.log("Begining rendering of your video. This might take a long time...")
    var ffmpeg = cp.spawn('ffmpeg', [
        '-framerate', '24',
        '-start_number', '0',
        '-i', 'image-%010d.png',
        '-refs', '5',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-pix_fmt', 'yuv420p',
        '-crf', '18',
        fullFilePath
    ], {
        cwd: imgDir,
        stdio: 'inherit'
    });

    ffmpeg.on('close', function (code) {
        console.log(sprintf('Finished rendering video. You can find it at %s/%s.mp4', videoDir, req.body.filename));
        fs_extra.removeSync(imgDir);
    });

    res.end();
});


router.post('/notification/finish-capturing', function (req, res) {
    var videoId = req.body.video_id;
    console.log("=========================================");
    console.log("\tFinish capturing images for [" + videoId + "] videoId");
    dal.updateVideoInfos(
        videoId, {
            status: 'CAPTURED',
            frame_count: req.body.total_frame
        },
        function (err, data) {
            if (err) console.error(error);
            console.log(data);
        }
    );

    res.end();
});


// get video detail
router.get('/videos/:videoId', function (req, res) {
    console.log("=========================================");
    var videoId = req.params.videoId;
    console.log("\tFinding video info for [" + videoId + "] videoId");

    dal.searchVideos({
        id: videoId
    }, function (err, videos) {
        if (err) {
            res.statusCode = 500;
            console.error("ERROR", err);
            res.send("Internal server error");
        } else {
            console.error("\tDONE");
            res.send(videos.shift());
        }
    });
});

// Search videos
router.post('/report/videos', function (req, res) {
    console.log("=========================================");
    console.log("\tSearching videos");
    var searchCriteria = {};

    if (req.body.status) {
        searchCriteria.status = req.body.status;
    }

    dal.searchVideos(searchCriteria, function (err, videos) {
        if (err) {
            res.statusCode = 500;
            console.error("ERROR", err);
            res.send("Internal server error");
        } else {
            console.error("\tDONE");
            res.send(videos);
        }
    });
});

module.exports = router;
