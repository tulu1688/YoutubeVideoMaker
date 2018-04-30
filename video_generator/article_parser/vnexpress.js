var cheerio = require('cheerio'),
    common_parser = require('./common.js'),
    _ = require('underscore');

module.exports = {
    parse: function(url, body) {
        var $ = cheerio.load(body);

        var removeElemt = [
            '.block_timer_share',
            '.div-fbook',
            '.relative_new',
            '.block_tag',
            '.box_category',
            '#box_tinkhac_detail',
            '.social_share',
            '#box_tinlienquan',
            '#box_comment'
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
