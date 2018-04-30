var html2Text = require('html-to-text'),
    cheerio = require('cheerio');

module.exports = {
    parse: function ($, contentTag, opts) {
        var images = [];

        if ($(contentTag) > 1)
            articleContent = $(contentTag)[0];
        else
            articleContent = $(contentTag);

        if (!articleContent)
            return null;

        // Replace image with bound <img>
        $('.tplCaption img').each(function () {
            images.push($(this).attr('src'));
        });
        $('img').remove();

        $('table').each(function () {
            var tblClass = $(this).attr('class');

            if (tblClass && opts.ignoreTableTag && tblClass.indexOf(opts.ignoreTableTag) > -1)
                return;

            var tableStr = html2Text.fromString('<table>' + $(this).html() + '</table>', {
                ignoreHref: true,
                linkHrefBaseUrl: true,
                wordwrap: 100000,
                tables: true
            });
            tableStr = tableStr.replace(/(?:\r\n|\r|\n)/g, '<br/>');
            tableStr = tableStr.replace(/ /g, 'TnbspL');
            var pre = '<span>&lt;pre&gt;' + tableStr + '&lt;/pre&gt;</span>';
            $(this).replaceWith(pre);
        });

        if (articleContent === null || articleContent === undefined) {
            return null;
        } else if (articleContent && articleContent !== null && articleContent !== undefined) {
            var text = html2Text.fromString(articleContent.html(), {
                ignoreHref: true,
                linkHrefBaseUrl: true,
                wordwrap: 100000
            });

            if (!text)
                return null;

            text = text.replace(/(?:\r\n|\r|\n)/g, ' '); // Replace carrier return with space
            text = text.replace(/TnbspL/g, ' ');

            if (text == 'null' || text == 'undefined') {
                return null;
            }
            
            return {
                content: text,
                images: images
            };
        }
    }
};
