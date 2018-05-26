var cheerio = require('cheerio'),
    common_parser = require('./common.js'),
    _ = require('underscore');

module.exports = {
    parse: function (url, body) {
        var $ = cheerio.load(body);

        var removeElemt = [
            '.breadcumb',
            '.leftdetail',
            '.social',
            '.link-content-footer',
            '.social-share',
            '.liketop',
            '.mgt15',
            '.PhotoCMS_Caption',
            '.tagnew'
        ];

        _.each(removeElemt, function (item) {
            $(item).remove();
        });

        return common_parser.parse($, '.detail', {
            url: url,
            imgTag: '.VCSortableInPreviewMode',
            titleTag: '.topdetail h1',
            descriptionTag: '.rightdetail h2'
        });
    }
};
