var ajax = require('marmottajax');

CVG = function() {
  this.AUTHORITY = 'http://localhost:3172';
  this.frameCount = -1;
};

CVG.prototype.addFrame = function(canvas){
    self = this;
    self.frameCount++;
    
    ajax({
      url: self.AUTHORITY + '/addFrame',
      method: 'post',
      parameters: {
        png: canvas.toDataURL(),
        frame: self.frameCount
      }
    }).error(function(err) {
      console.warn(err);
    });
}

CVG.prototype.render = function(filename){
    self = this;
    self.filename = filename || 'untitled';
    
    ajax({
      url: self.AUTHORITY + '/render',
      method: 'post',
      parameters: {
        filename: self.filename
      }
    }).error(function(err) {
      console.warn(err);
    });    
}

module.exports = new CVG();