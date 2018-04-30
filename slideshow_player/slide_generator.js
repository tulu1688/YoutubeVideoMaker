var slideDict = require('./slide_dict.js').slideDict;
var fs = require('fs');

slideGenerator = function () {
    this.SLIDES = 1000; // We try to create ultimate video
    this.images = [];
};

slideGenerator.prototype.loadImages = function (images) {
    this.images = this.images.concat(images);
}

slideGenerator.prototype.generateSlides = function (images) {
    this.images = this.images.concat(images);
    var slides = [];

    for (var i = 0; i < this.SLIDES; i++) {
        var item = slideDict[Math.floor(Math.random() * slideDict.length)];
        var image = this.images[Math.floor(Math.random() * this.images.length)]
        item.image = image;
        slides.push(item);
    }

    return {timeline: slides};
}

module.exports = new slideGenerator();