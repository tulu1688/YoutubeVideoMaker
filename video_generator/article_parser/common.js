var html2Text = require('html-to-text'),
    cheerio = require('cheerio');

module.exports = {
    parse: function($, contentTag, opts) {
        $('img').removeAttr('alt');
        if ($(contentTag) > 1)
            articleContent = $(contentTag)[0];
        else
            articleContent = $(contentTag);

        if (!articleContent)
            return null;

        // Replace image with bound <img>
        $('img').each(function() {
            var p = '<span>&lt;img&nbsp;class="cenimg"&nbsp;src="' + $(this).attr('src') + '"/&gt;</span>';
            $(this).replaceWith(p);
        });

        $('h1').each(function() {
            var p = '<span>&lt;h1&gt;' + $(this).html() + '&lt;/h1&gt;</span>';
            $(this).replaceWith(p);
        });
        $('h2').each(function() {
            var p = '<span>&lt;h2&gt;' + $(this).html() + '&lt;/h2&gt;</span>';
            $(this).replaceWith(p);
        });
        $('h3').each(function() {
            var p = '<span>&lt;h3&gt;' + $(this).html() + '&lt;/h3&gt;</span>';
            $(this).replaceWith(p);
        });
        $('h4').each(function() {
            var p = '<span>&lt;h4&gt;' + $(this).html() + '&lt;/h4&gt;</span>';
            $(this).replaceWith(p);
        });
        $('h5').each(function() {
            var p = '<span>&lt;h5&gt;' + $(this).html() + '&lt;/h5&gt;</span>';
            $(this).replaceWith(p);
        });

        $('table').each(function() {
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

            text = text.replace(/(?:\r\n|\r|\n)/g, '<br/>');
            text = text.replace(/TnbspL/g, ' ');

            if (text == 'null' || text == 'undefined') {
                return null;
            }

            return text;
        }
    }
};
