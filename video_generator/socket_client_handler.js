var async = require('async'),
    config = require('config');

var article_parser = require('./article_parser/parse.js'),
    dal = require('./dal.js');

module.exports = function (client) {
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
}
