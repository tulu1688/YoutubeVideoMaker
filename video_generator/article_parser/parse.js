var request = require('request'),
    fs = require('fs'),
    _ = require('underscore'),
    download = require('image-downloader');

var vnexpressParser = require('./vnexpress.js');

var parseUrl = function (video, imgPath, callback) {
    var url = video.url;
    var youtubeVideoInfoId = video.id;
    
    request(url, {
        timeout: 30000
    }, function (error, response, body) {
        if (error)
            callback(err, null);
        
        if (response.statusCode != 200)
            callback({
                internelError: 'READ_URL_FAIL',
                status: response.statusCode,
                message: response.statusMessage
            }, null);
        
        if (body) {
            var parser = null;
            if (url.indexOf('dantri.com.vn') > -1) {
                //                parser = dantriParser;
            } else if (url.indexOf('vnexpress.net') > -1) {
                parser = vnexpressParser;
            }

            if (parser) {
                var result = parser.parse(url, body);

                // Download images
                var downloaded = 0;
                var downloadedFilePath = [];
                
                if (result) {
                    _.each(result.images, function (url, index) {
                        download.image({
                                url: url,
                                dest: imgPath
                            })
                            .then(({
                                filename,
                                image
                            }) => {
                                downloadedFilePath.push('images/' + getFileName(filename));
                                downloaded++;

                                if (downloaded == result.images.length)
                                    callback(null, {
                                        ref_id: youtubeVideoInfoId,
                                        url: url,
                                        content: result.content,
                                        images: downloadedFilePath
                                    });
                            }).catch((err) => {
                                err.ref_id = youtubeVideoInfoId;
                                callback(err, null);
                            })
                    });
                } else {
                    callback({internelError: 'PARSE_FAIL', ref_id: youtubeVideoInfoId},null);
                }
            } else {
                callback({internelError: 'NO_PARSER', ref_id: youtubeVideoInfoId},null);
            }
        }
    });
}

function getFileName(fullPath) {
    return fullPath.replace(/^.*[\\\/]/, '')
}

exports.fetch = parseUrl;
