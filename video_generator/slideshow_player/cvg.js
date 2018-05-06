var ajax = require('marmottajax');

CVG = function () {
    this.VIDEO_GENERATOR_URL = '/v1.0'
};

CVG.prototype.addFrame = function (canvas, videoInfoId, frameId) {
    self = this;

    ajax({
        url: self.VIDEO_GENERATOR_URL + '/add-frame',
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
