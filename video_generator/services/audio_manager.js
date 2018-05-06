var fs = require('fs'),
    async = require('async'),
    _ = require('underscore'),
    cp = require('child_process'),
    mp3Duration = require('mp3-duration');

AudioManager = function () {
    this.tracks = [];
    this.audioDir = null;
};

AudioManager.prototype.init = function (audioPath) {
    var self = this;
    self.audioDir = audioPath;

    var audioDurationRetriever = function (err) {
        if (err)
            console.error("Retriever mp3 info fail", err);
    };

    console.log("=========================================");
    console.log("\tLoading audio tracks in [" + audioPath + "] folder");
    fs.readdirSync(audioPath).forEach(file => {
        if (file.toLowerCase().indexOf('.mp3') > -1) {
            self.tracks.push({
                path: file
            });
        }
    });

    async.each(self.tracks,
        function (audioTrack, audioDurationRetriever) {
            mp3Duration(audioPath + "/" + audioTrack.path, function (err, duration) {
                if (err)
                    audioDurationRetriever(err);
                else {
                    audioTrack.duration = duration;
                    audioDurationRetriever();
                }
            });
        },
        function (err) {
            if (err)
                console.log(err);
            else {
                console.log("\tFinish load [" + self.tracks.length + "] track(s)");
            }
        }
    );
}

AudioManager.prototype.getAudioTrack = function (frameNo, callback) {
    var self = this;
    var tracks = this.tracks.slice(0);
    tracks.sort(() => Math.random() - 0.5);

    async.waterfall([
            function (callback) {
                var total_duration = 0;
                var videoDuration = frameNo / 24;
                // var videoDuration = 500;
                var fileList = [];
                var index = 0;

                while (videoDuration > total_duration) {
                    total_duration += tracks[index].duration;
                    fileList.push(tracks[index].path);

                    index++;
                    if (index == tracks.length)
                        index = 0;
                }

                callback(null, fileList);
            },
            function (fileList, callback) {
                if (fileList.length == 1) {
                    callback(null, {
                        fileName: fileList.shift()
                    });
                } else {
                    var now = (new Date()).getTime();
                    var tmpMp3FileName = '' + now + '.mp3';
                    var tmpTxtFileName = '' + now + '.txt';

                    var tmpFileContent = '';
                    _.each(fileList, function (file) {
                        tmpFileContent += "file '" + file + "'\n";
                    });
                    fs.writeFileSync(self.audioDir + '/' + tmpTxtFileName, tmpFileContent, 'utf8');

                    // Merge multiple mp3 file
                    // ffmpeg -f concat -safe 0 -i myList.txt -c copy test.mp3
                    var ffmpeg = cp.spawn('ffmpeg', [
                        '-f', 'concat',
                        '-safe', '0',
                        '-i', tmpTxtFileName,
                        '-c', 'copy',
                        tmpMp3FileName
                    ], {
                        cwd: self.audioDir,
                        stdio: 'inherit'
                    });

                    ffmpeg.on('close', function (code) {
                        fs.unlinkSync(self.audioDir + '/' + tmpTxtFileName);
                        
                        callback(null, {
                            fileName: tmpMp3FileName,
                            tmpFile: self.audioDir + '/' + tmpMp3FileName
                        });
                    });
                }
            }
        ],
        function (err, data) {
            if (err) {} else {
                callback(null, {
                    fileName: self.audioDir + '/' + data.fileName,
                    tmpFile: data.tmpFile
                });
            }
        }
    );

}

module.exports = new AudioManager();
