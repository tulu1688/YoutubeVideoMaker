var request = require('request'),
    fs = require('fs'),
    _ = require('underscore');
var vnexpressParser = require('./vnexpress.js');

var parseUrl = function(url, client) {
    request(url, {
        timeout: 30000
    }, function(error, response, body) {
        if (body) {
            var parser = null;
            if (url.indexOf('dantri.com.vn') > -1) {
//                parser = dantriParser;
            } else if (url.indexOf('vnexpress.net') > -1) {
                parser = vnexpressParser;
            }
            
            if (parser) {
                var content = parser.parse(url, body);
                client.emit('article', content);
            }
        } else {
             console.log('error', url);
        }
    });
}

exports.fetch = parseUrl;