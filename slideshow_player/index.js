var Diaporama = require("diaporama");
var GlslTransitions = require("glsl-transitions");
var beautify = require("json-beautify");
var dateFormat = require('dateformat');
var socket = require('socket.io-client')('http://localhost:3172');
var cheerio = require('cheerio');

var cvg = require('./cvg.js');
var text_utils = require('./text_utils.js');
var slide_generator = require('./slide_generator.js');
slide_generator.loadImages([
    'girls/bn1.jpg',
    'girls/bn2.jpg',
    'girls/bn3.jpg',
    'girls/bn4.jpg',
    'girls/bn5.jpg',
    'girls/bn6.jpg',
    'girls/bn7.jpg',
    'girls/bn8.jpg',
    'girls/bn9.jpg',
    'girls/bn10.jpg',
    'girls/bn11.jpg',
    'girls/bn12.jpg',
    'girls/bn13.jpg',
    'girls/bn14.jpg',
    'girls/bn15.jpg',
    'girls/bn16.jpg',
    'girls/bn17.jpg',
    'example3/gladiator.jpg',
    'example3/leaves.jpg',
    'example3/paris.jpg',
    'example3/run.jpg',
    'example3/train.jpg'
]);
slides = slide_generator.generateSlides();
slides.transitions = GlslTransitions;
console.log(slides);

// Widgets
var fetchUrlBtn = document.getElementById("fetchUrlBtn");
var urlTxt = document.getElementById("urlTxt");
var articleContentEditText = document.getElementById("articleContentEditText");

fetchUrlBtn.onclick = function(){
    socket.emit("url", {url: urlTxt.value});
}

// Socket.io command
socket.on('connect', function(){
    console.log("Socket.io connected");
});
socket.on('article', function(data){
    articleContentEditText.value = data;
});
socket.on('disconnect', function(){});

// Create the Diaporama (empty for now)
Diaporama.localize(slides, './');
var diaporama = null;

function setupDiaporama(){
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
    
    return diaporama;
}

function resetDiaporama(){
    diaporama.destroy();
    canvas.parentNode.removeChild(canvas);
    canvas = null;
}

// Control the diaporama
var isRecording = false;
var subtitle = '';
var frameIndex = 0;
var resetIndex = 24; // 1 sec without subtitle
var paragrahps = [];

var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
startBtn.onclick = function () {
    diaporama = setupDiaporama();
    diaporama.data = slides;
    
    if (articleContentEditText.value)
        paragrahps = text_utils.splitArticleToLines(articleContentEditText.value)
    
    diaporama.play();
    isRecording = true;
    renderVideo();
};
stopBtn.onclick = function () {
    stopAndRenderVideo();
    resetDiaporama();
};


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
    
    copied_context.clearRect(0, 0, copied_canvas.width, copied_canvas.height);
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
            } else {
                stopAndRenderVideo();
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
        } else {
            resetIndex = 48; // 2 sec to end
        }
    }
}