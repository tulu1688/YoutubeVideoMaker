var express = require('express'),
    config = require('config'),
    sprintf = require('sprintf').sprintf,
    fs = require('fs'),
    fs_extra = require('fs-extra'),
    cp = require('child_process'),
    async = require('async'),
    router = express.Router();

var dal = require('../dal.js'),
    audioManager = require('../services/audio_manager.js');

var preRenderDir = config.get('path.imagePath.preRender');
var videoDir = config.get('path.videoPath');
var audioDir = config.get('path.audioPath');

// Inititalize
audioManager.init(audioDir);

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
    var videoId = req.body.video_id;
    console.log("=========================================");
    console.log("\tFinish capturing images for [" + videoId + "] videoId");

    if (videoId) {
        var imgDir = sprintf('%s/%s', preRenderDir, videoId);
        var fullFilePath = sprintf('%s/%s.mp4', videoDir, videoId);

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
            console.log(sprintf('Finished rendering video. You can find it at %s/%s.mp4', videoDir, videoId));
            fs_extra.removeSync(imgDir);

            dal.updateVideoInfos(
                videoId, {
                    status: 'RENDERED'
                },
                function (err, data) {
                    if (err) console.error(error);
                    console.log(data);
                }
            );

            res.end();
        });
    } else {
        res.end();
    }
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


router.post('/merge-audio', function (req, res) {
    var videoId = req.body.video_id;
    console.log("=========================================");
    console.log("\tStart merge audio for [" + videoId + "] videoId");

    async.waterfall([
            function (callback) {
                console.log("\tGet detail info for [" + videoId + "] videoId");
                dal.searchVideos({
                    id: videoId
                }, callback);
            },
            function (videos, callback) {
                console.log("\tGet audio track");
                var video = videos.shift();
                audioManager.getAudioTrack(video.frame_count, callback);
            },
            function (audioTrackInfo, callback) {
                console.log("\tStart merge audio. It might take some time");

                var finalVideoPath = '' + videoId + '_final.mp4';
                var ffmpeg = cp.spawn('ffmpeg', [
                    '-i', videoId + '.mp4',
                    '-i', audioTrackInfo.fileName,
                    '-codec', 'copy',
                    '-shortest',
                    finalVideoPath
                ], {
                    cwd: videoDir,
                    stdio: 'inherit'
                });

                ffmpeg.on('close', function (code) {
                    console.log(sprintf('Finished merge soundtrack. You can find it at %s', finalVideoPath));
                    
                    // Clean up tmp file if exist
                    if (audioTrackInfo.tmpFile)
                        fs.unlinkSync(audioTrackInfo.tmpFile);

                    dal.updateVideoInfos(
                        videoId, {
                            status: 'MERGE_MUSIC'
                        },
                        function (err, data) {
                            if (err) console.error(error);
                            if (data) console.log(data);
                        }
                    );

                    callback(null, code);
                });
            }
        ],
        function (err, data) {
            if (err) {
                
            } else {
                res.end();
            }
        }
    );
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
    console.log("\tSearching videos with criteria", req.body);
    var searchCriteria = {};

    if (req.body.status) {
        searchCriteria.status = req.body.status;
    }
    if (req.body.is_deleted) {
        searchCriteria.is_deleted = req.body.is_deleted;
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
