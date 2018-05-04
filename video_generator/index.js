var browserify = require('browserify'),
    bodyParser = require('body-parser'),
    minimist = require('minimist'),
    express = require('express'),
    sprintf = require('sprintf').sprintf,
    cp = require('child_process'),
    fs = require('fs'),
    fs_extra = require('fs-extra'),
    async = require('async'),
    config = require('config');

var article_parser = require('./article_parser/parse.js'),
    dal = require('./dal.js');

var args = minimist(process.argv.slice(2));
if (args.h || args.help) {
    console.log('usage: cvg [options]');
    console.log();
    console.log('options:');
    console.log('  -h --help:     This help');
    console.log('  -p --port:     Port to use [3172]');
    console.log('  -o --odir:     Directory to store final video in [current working directory]');
    console.log('  -n --noclean:  Do not clean up temporary files [false]')
    process.exit();
}

var PORT = args.p || args.port || config.get('app.port') || 3172;
var OUTDIR = args.o || args.odir || process.cwd();
var NOCLEAN = args.n || args.noclean || false;
var APIVERSION = config.get('app.apiVersion');


// Connect db first
dal.connectDb(
    config.get('dbConfig.host'),
    config.get('dbConfig.user'),
    config.get('dbConfig.password'),
    config.get('dbConfig.dbName')
);

var app = express();
var http = require('http').Server(app);
var preRenderDir = config.get('path.imagePath.preRender');
var videoDir = config.get('path.videoPath');

app.use(function (req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '100mb'
}));


app.post('/' + APIVERSION + '/add-frame', function (req, res) {
    var data = req.body.png.replace(/^data:image\/png;base64,/, "");
    var filename = sprintf('image-%010d.png', parseInt(req.body.frame));
    var outDir = sprintf('%s/%s', preRenderDir, req.body.video_id);

    fs_extra.ensureDirSync(outDir);

    fs.writeFileSync(sprintf('%s/%s', outDir, filename), data, 'base64');

    res.end();
    process.stdout.write(sprintf('Recieved frame %s\r', req.body.frame));
});


app.post('/' + APIVERSION + '/render', function (req, res) {
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


app.post('/' + APIVERSION + '/notification/finish-capturing', function (req, res) {
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


app.get('/' + APIVERSION + '/videos/:videoId', function (req, res) {
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


var io = require('socket.io')(http);
io.set('origins', '*:*');
http.listen(PORT, function () {
    console.log("Canvas video generator server listening on port " + PORT + ".");
});
io.sockets.on('connection', function (client) {
    client.on("url", function (data) {
        var fectchCallback = function (err, data) {
            if (err) console.error(error);
            console.log(data);
        };

        async.waterfall([
            function (callback) {
                    console.log("=========================================")
                    console.log("\tFinding [" + data.url + "] url in db");
                    dal.searchVideos({
                        url: data.url
                    }, callback);
            },
            function (videos, callback) {
                    if (!videos.length) {
                        console.log("\tCreating video info for [" + data.url + "] url in db");
                        dal.createVideoInfoFromUrl(data.url, "CREATED", callback);
                    } else {
                        console.log("\tFound " + videos.length + " video(s)");
                        video = videos.shift();
                        callback(null, video);
                    }
            },
            function (video, callback) {
                    console.log("\tStart fetching [" + video.url + "] url");
                    article_parser.fetch(
                        video,
                        config.get('path.imagePath.download'),
                        callback);
            },
            function (data, callback) {
                    console.log("\tFinish fetch article content for [" + data.url + "] url");
                    data.status = 'success';
                    client.emit('article', data);
                    callback(null, data.ref_id);
            }
        ],
            function (err, data) {
                if (err) {
                    if (err.internelError) {
                        dal.updateVideoInfos(err.ref_id, {
                            status: 'FETCH_FAIL',
                            status_message: err.internelError
                        }, fectchCallback);
                    } else {
                        console.error("Parse fail with error", err);
                        dal.updateVideoInfos(err.ref_id, {
                            status: 'FETCH_FAIL',
                            status_message: 'GENERAL_ERROR'
                        }, fectchCallback);
                    }

                    client.emit('article', {
                        status: 'fail',
                        ref_id: err.ref_id
                    });
                } else {
                    dal.updateVideoInfos(data, {
                        status: 'FETCH_SUCCESS'
                    }, fectchCallback);
                }
            }
        );
    });
});
