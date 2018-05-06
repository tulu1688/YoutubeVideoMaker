var request = require('request'),
    fs = require('fs'),
    _ = require('underscore'),
    async = require('async'),
    download = require('image-downloader');

var vnexpressParser = require('./vnexpress.js');

var parseUrl = function (video, imgPath, callback) {
    var url = video.url;
    var youtubeVideoInfoId = video.id;

    request(url, {
        timeout: 30000
    }, function (error, response, body) {
        if (error) {
            error.ref_id = youtubeVideoInfoId;
            callback(error, null);
        } else if (response.statusCode != 200) {
            callback({
                internelError: 'READ_URL_FAIL',
                ref_id: youtubeVideoInfoId,
                status: response.statusCode,
                message: response.statusMessage
            }, null);
        } else {
            var parser = null;
            if (url.indexOf('dantri.com.vn') > -1) {
                //                parser = dantriParser;
            } else if (url.indexOf('vnexpress.net') > -1) {
                parser = vnexpressParser;
            }

            if (parser) {
                var result = parser.parse(url, body);

                // Download images
                var downloadedFilePath = [];

                if (result) {
                    async.each(result.images,
                        function (url, downloadImgCallback) {
                            console.log('Dowloading image from [' + url + '] url');
                            download.image({
                                    url: url,
                                    dest: imgPath
                                })
                                .then(({
                                    filename,
                                    image
                                }) => {
                                    downloadedFilePath.push(getFileName(filename));
                                    downloadImgCallback();
                                }).catch((err) => {
                                    downloadImgCallback(err);
                                });
                        },
                        function (err) {
                            if (err) {
                                err.ref_id = youtubeVideoInfoId;
                                callback(err, null);
                            } else {
                                callback(null, {
                                    ref_id: youtubeVideoInfoId,
                                    url: url,
                                    content: result.content,
                                    images: downloadedFilePath,
                                    title: result.title,
                                    description: result.description,
                                    thumbnail: result.images[0]
                                });

                            }
                        }
                    );
                } else {
                    callback({
                        internelError: 'PARSE_FAIL',
                        ref_id: youtubeVideoInfoId
                    }, null);
                }
            } else {
                callback({
                    internelError: 'NO_PARSER',
                    ref_id: youtubeVideoInfoId
                }, null);
            }
        }
    });
}

function getFileName(fullPath) {
    return fullPath.replace(/^.*[\\\/]/, '')
}

exports.fetch = parseUrl;
