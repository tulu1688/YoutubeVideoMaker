var cheerio = require('cheerio'),
    common_parser = require('./common.js'),
    _ = require('underscore');

module.exports = {
    parse: function(url, body) {
        var $ = cheerio.load(body);

        var removeElemt = [
            '.author_mail',
            '.clearfix',
            '.related_news',
            '.wrap_xemthem',
            '.title_box',
            '.list_news_quantam',
            '.Image'
        ];

        _.each(removeElemt, function(item) {
            $(item).remove();
        });

        if (url.indexOf('vnexpress.net/photo') > -1) {
            return common_parser.parse($, '.w670', {
                url: url,
                ignoreTableTag: 'tplCaption'
            });
        } else {
            return common_parser.parse($, '.sidebar_1', {
                url: url,
                ignoreTableTag: 'tplCaption'
            });
        }
    }
};
