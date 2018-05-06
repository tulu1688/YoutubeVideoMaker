var html2Text = require('html-to-text'),
    cheerio = require('cheerio');

function dom2Text(htmlContent) {
    return html2Text.fromString(htmlContent, {
        ignoreHref: true,
        linkHrefBaseUrl: true,
        wordwrap: 100000,
        format: {
            heading: function (elem, fn, options) {
                return fn(elem.children, options);
            }
        }
    });
};

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
        $(opts.imgTag + ' img').each(function () {
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

        var description = null;
        var title = null;
        if (opts.titleTag) {
            title = dom2Text($(opts.titleTag));
            $(opts.titleTag).remove();
            console.log(title);
        }
        if (opts.descriptionTag) {
            description = dom2Text($(opts.descriptionTag).html())
        }

        var text = dom2Text(articleContent);

        if (text) {
            text = text.replace(/(?:\r\n|\r|\n)/g, ' '); // Replace carrier return with space
            text = text.replace(/TnbspL/g, ' ');

            return {
                content: text,
                images: images,
                title: title,
                description: description
            };
        } else {
            return null;
        }
    }
};
