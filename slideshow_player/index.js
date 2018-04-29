var Diaporama = require("diaporama");
var GlslTransitions = require("glsl-transitions");
var beautify = require("json-beautify");
var dateFormat = require('dateformat');
var socket = require('socket.io-client')('http://localhost:3172');
var cheerio = require('cheerio');

var cvg = require('./cvg.js');
var text_utils = require('./text_utils.js');

// Widgets
var fetchUrlBtn = document.getElementById("fetchUrlBtn");
var urlTxt = document.getElementById("urlTxt");

fetchUrlBtn.onclick = function(){
    socket.emit("url", {url: urlTxt.value});
}

// Socket.io command
socket.on('connect', function(){
    console.log("Socket.io connected");
});
socket.on('article', function(data){
    
});
socket.on('disconnect', function(){});

// Create the Diaporama (empty for now)
var data = require("./example3/diaporama.json");
data.transitions = GlslTransitions;
Diaporama.localize(data, './example3/');
var diaporama = Diaporama(document.getElementById("diaporama"), null, {
    autoplay: false,
    loop: false
});
diaporama.width = 1280;
diaporama.height = 720;

diaporama.on("error", console.error.bind(console));
diaporama.on("load", function () {
    console.log("Slideshow has loaded");
    if (canvas == null) {
        canvas = document.getElementById('diaporamaContainer').querySelector('canvas');
    }
});
diaporama.on("ended", function () {
    console.log("Slideshow is ended");
    stopAndRenderVideo();
});

// Control the diaporama
var isRecording = false;
var subtitle = '';
var frameIndex = 0;
var resetIndex = 24; // 1 sec without subtitle

var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
startBtn.onclick = function () {
    diaporama.data = data;
    
    diaporama.play();
    isRecording = true;
    renderVideo();
};
stopBtn.onclick = function () {
    stopAndRenderVideo();
    diaporama.destroy();
};


var article = 'look at mozilla.org. If you can see the selected text, and see its wider than your canvas, you can remove words, until the text is short enough. With the removed words, you can start at the second line and do the same.Of course, this will not be very efficient, so you can improve it by not removing one word, but multiple words if you see the text is much wider than the canvas width. I did not research, but maybe their are even javascript libraries that do this for you';
var paragrahps = text_utils.splitArticleToLines(article);


// Prepare canvases
var canvas = null;
var copied_canvas = document.getElementById('2dCanvas');
var copied_context = copied_canvas.getContext('2d');
copied_context.font="45px Verdana";
copied_context.fillStyle = '#fff';
copied_context.shadowColor = '#000';
copied_context.shadowOffsetX = 3;
copied_context.shadowOffsetY = 0;
copied_context.shadowBlur = 10;

function stopAndRenderVideo() {
    var now = new Date();
    var fileName = "example_" + dateFormat(now, "yyyymmdd_HHMMss");
    isRecording = false;
    cvg.render(fileName);
}

function renderVideo() {
    if (isRecording) {
        cvg.addFrame(copied_canvas);
        
        // Check to load subtitle
        frameIndex ++;
        if (frameIndex >= resetIndex) {
            subtitle = paragrahps.shift();
            if (subtitle) {
                var printInfos = text_utils.getLines(copied_context, subtitle, 1100);
                resetIndex = printInfos.no_of_frames;
                frameIndex = 0;
            }
        }

        requestAnimationFrame(renderVideo);
        
        if (copied_canvas && canvas) {
            copied_context.drawImage(canvas, 0, 0);
        }
        
        // Generate text and add here
        var startY = 500;
        if (subtitle) {
            printInfos = text_utils.getLines(copied_context, subtitle, 1100);
            for (var i=0;i< printInfos.lines.length ;i++) {
                var line = printInfos.lines[i];
                text_utils.writeLine(copied_context, line, 1200, startY);
                startY += 50;
            }
        }
    }
}