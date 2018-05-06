var fs = require('fs'),
    async = require('async'),
    mp3Duration = require('mp3-duration');

AudioManager = function () {
    this.tracks = [];
    this.audoDir = null;
};

AudioManager.prototype.init = function (audioPath) {
    var self = this;
    self.audoDir = audioPath;
    
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

AudioManager.prototype.getAudioTrack = function(frameNo, callback){
    var tracks = this.tracks.slice(0);
    tracks.sort(() => Math.random() - 0.5);
    
    // TODO find suitable track with length
    // If no track sutable => merge audio
    callback(null, this.audoDir + '/' + tracks[0].path);
}

module.exports = new AudioManager();
