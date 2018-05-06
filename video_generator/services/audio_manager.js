var fs = require('fs'),
    async = require('async'),
    mp3Duration = require('mp3-duration');

AudioManager = function () {
    this.tracks = [];
};

AudioManager.prototype.init = function (audioPath) {
    var self = this;

    console.log("=========================================");
    console.log("\tLoading audio tracks in [" + audioPath + "] folder");

    var audioDurationRetriever = function (err) {
        if (err)
            console.error("Retriever mp3 info fail", err);
    };

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

module.exports = new AudioManager();
