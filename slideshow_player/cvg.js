var ajax = require('marmottajax');

CVG = function () {
    this.VIDEO_GENERATOR_URL = 'http://localhost:3172'
};

CVG.prototype.addFrame = function (canvas, videoInfoId, frameId) {
    self = this;

    ajax({
        url: self.VIDEO_GENERATOR_URL + '/addFrame',
        method: 'post',
        parameters: {
            png: canvas.toDataURL(),
            frame: frameId,
            video_id: videoInfoId
        }
    }).error(function (err) {
        console.warn(err);
    });
}

CVG.prototype.render = function (filename) {
    self = this;
    self.filename = filename || 'untitled';

    ajax({
        url: self.VIDEO_GENERATOR_URL + '/render',
        method: 'post',
        parameters: {
            filename: self.filename
        }
    }).error(function (err) {
        console.warn(err);
    });
}

CVG.prototype.notifyFinishCapture = function(videoInfoId, totalFrames){
    self = this;

    ajax({
        url: self.VIDEO_GENERATOR_URL + '/notification/finish-capturing',
        method: 'post',
        parameters: {
            video_id: videoInfoId,
            total_frame: totalFrames
        }
    }).error(function (err) {
        console.warn(err);
    });
}

module.exports = new CVG();
