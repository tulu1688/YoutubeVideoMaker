textUtils = function() {
  this.TEXT_SPEED = 3.5;
};


textUtils.prototype.getLines = function(ctx, text, maxWidth){
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    
    lines.push(currentLine);
    
    return {
        lines: lines,
        no_of_words: words.length,
        no_of_frames: words.length * 7 // 24 frame per sec, 3.5 words per sec ==> 6.8 (~7) frame per word
    }
}

textUtils.prototype.splitArticleToLines = function(article){
    var words = article.split(" ");
    var lines = [];
    var currentLine = "";
    var minWords = 17;
    var maxWords = 27;
    var wordNo = 0;

    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (wordNo == maxWords-1 || (wordNo >= minWords && word.indexOf('.') > -1)) {
            currentLine += " " + word;
            lines.push(currentLine);
            
            currentLine = "";
            wordNo = 0;
        } else {
            currentLine += " " + word;
            wordNo += 1;
        }
    }
    
    lines.push(currentLine);
    
    return lines;
}

module.exports = new textUtils();