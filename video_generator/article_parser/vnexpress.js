var cheerio = require('cheerio'),
    common_parser = require('./common.js'),
    _ = require('underscore');

module.exports = {
    parse: function (url, body) {
        var $ = cheerio.load(body);

        var removeElemt = [
            '.author_mail',
            '.clearfix',
            '.related_news',
            '.wrap_xemthem',
            '.title_box',
            '.list_news_quantam',
            '.Image',
            '.txt_feedback'
        ];

        _.each(removeElemt, function (item) {
            $(item).remove();
        });

        return common_parser.parse($, '.sidebar_1', {
            url: url,
            ignoreTableTag: 'tplCaption',
            imgTag: '.tplCaption',
            titleTag: '.title_news_detail',
            descriptionTag: '.description'
        });
    }
};
