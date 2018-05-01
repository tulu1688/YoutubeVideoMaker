var browserify = require('browserify');
bodyParser = require('body-parser');
minimist = require('minimist');
express = require('express');
sprintf = require('sprintf').sprintf;
tmp = require('tmp');
cp = require('child_process');
fs = require('fs'),
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
tempDir = tmp.dirSync({
    unsafeCleanup: true
});


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


app.post('/addFrame', function (req, res) {
    var data = req.body.png.replace(/^data:image\/png;base64,/, "");
    var filename = sprintf('image-%010d.png', parseInt(req.body.frame));
    fs.writeFileSync(sprintf('%s/%s', tempDir.name, filename), data, 'base64');
    res.end();
    process.stdout.write(sprintf('Recieved frame %s\r', req.body.frame));
});


app.post('/render', function (req, res) {
    var oldTemp = tempDir;
    console.log("Begining rendering of your video. This might take a long time...")
    var ffmpeg = cp.spawn('ffmpeg', [
        '-framerate', '24',
        '-start_number', '0',
        '-i', 'image-%010d.png',
        '-refs', '5',
        '-c:v', 'libx264',
        '-preset', 'veryslow',
        '-pix_fmt', 'yuv420p',
        '-crf', '18',
        sprintf('%s/%s.mp4', OUTDIR, req.body.filename)
    ], {
        cwd: oldTemp.name,
        stdio: 'inherit'
    });
    ffmpeg.on('close', function (code) {
        console.log(sprintf('Finished rendering video. You can find it at %s/%s.mp4', OUTDIR, req.body.filename));
        if (NOCLEAN) {
            console.log(sprintf('Not cleaning temp files. You can find them in %s', oldTemp.name));
        } else {
            console.log(sprintf('Cleaning up temp files in %s', oldTemp.name));
            oldTemp.removeCallback();
        }
    });
    tempDir = tmp.dirSync({
        unsafeCleanup: true
    });
    res.end();
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
                    console.log("==> Finding [" + data.url + "] url in db");
                    dal.getVideoInfosFromUrl(data.url, callback);
            },
            function (videos, callback) {
                    if (!videos.length) {
                        console.log("==> Creating video info for [" + data.url + "] url in db");
                        dal.createVideoInfoFromUrl(data.url, "CREATED", callback);
                    } else {
                        video = videos.shift();
                        callback(null, video);
                    }
            },
            function (video, callback) {
                    console.log("==> Start fetching [" + video.url + "] url");
                    article_parser.fetch(
                        video,
                        config.get('path.imagePath.download'),
                        callback);
            },
            function (data, callback) {
                    console.log("==> Finish fetch article content for [" + data.url + "] url");
                    client.emit('article', data);
                    callback(null, data.ref_id);
            }
        ],
            function (err, data) {
                if (err) {
                    if (err.internelError) {
                        dal.updateVideoInfoStatus(err.ref_id, 'FETCH_FAIL', err.internelError, fectchCallback);
                    } else {
                        console.error("Parse fail with error", err);
                        dal.updateVideoInfoStatus(err.ref_id, 'FETCH_FAIL', 'GENERAL_ERROR', fectchCallback);
                    }
                } else {
                    dal.updateVideoInfoStatus(data, 'FETCH_SUCCESS', null, fectchCallback);
                }
            }
        );
    });
});
