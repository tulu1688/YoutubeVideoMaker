var Diaporama = require("diaporama");
var GlslTransitions = require("glsl-transitions");
var beautify = require("json-beautify");
var dateFormat = require('dateformat');
var socket = require('socket.io-client')('http://localhost:3172');
var cheerio = require('cheerio');

var cvg = require('./cvg.js'),
    text_utils = require('./text_utils.js'),
    slide_generator = require('./slide_generator.js'),
    notification_utils = require('./notification_utils.js');

// Widgets
var fetchUrlBtn = document.getElementById("fetchUrlBtn");
var urlTxt = document.getElementById("urlTxt");
var articleContentEditText = document.getElementById("articleContentEditText");
var videoInfoId = null;

// Article related vars
var paragrahps = [];

fetchUrlBtn.onclick = function () {
    socket.emit("url", {
        url: urlTxt.value
    });
}

// Socket.io command
socket.on('connect', function () {
    console.log("Socket.io connected");
});
socket.on('article', function (data) {
    if (data.status == 'success') {
        if (data.images.length) {
            slides = slide_generator.generateSlides(data.images);
            slides.transitions = GlslTransitions;
        }

        videoInfoId = data.ref_id;
        articleContentEditText.value = data.content;
        // Reset paragraphs
        paragrahps = [];
    } else if (data.status == 'fail') {
        articleContentEditText.value = '';
    }
});
socket.on('disconnect', function () {});

// Create the Diaporama (empty for now)
var diaporama = null;

function setupDiaporama() {
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

function resetDiaporama() {
    diaporama.destroy();
    canvas.parentNode.removeChild(canvas);
    canvas = null;
}

// Control the diaporama
var isRecording = false;
var subtitle = '';
var frameIndex = 0;
var globalFrameIndex = 0;
var resetIndex = 24; // 1 sec without subtitle

var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
startBtn.onclick = function () {
    if (videoInfoId) {
        frameIndex = 0;
        globalFrameIndex = 0;

        diaporama = setupDiaporama();
        diaporama.data = slides;

        if (articleContentEditText.value)
            paragrahps = text_utils.splitArticleToLines(articleContentEditText.value)

        diaporama.play();
        isRecording = true;
        renderVideo();
    }
};
stopBtn.onclick = function () {
    stopAndRenderVideo();
};


// Prepare canvases
var canvas = null;
var copied_canvas = document.getElementById('2dCanvas');
var copied_context = copied_canvas.getContext('2d');
copied_context.font = "45px Verdana";
copied_context.fillStyle = '#fff';
copied_context.shadowColor = '#000';
copied_context.shadowOffsetX = 3;
copied_context.shadowOffsetY = 0;
copied_context.shadowBlur = 10;

function stopAndRenderVideo() {
    isRecording = false;
    cvg.render('' + videoInfoId);
    copied_context.clearRect(0, 0, copied_canvas.width, copied_canvas.height);

    resetDiaporama();
}

function renderVideo() {
    if (isRecording) {
        cvg.addFrame(copied_canvas, videoInfoId, globalFrameIndex);

        // Check to load subtitle
        frameIndex++;
        globalFrameIndex++;

        if (frameIndex >= resetIndex) {
            subtitle = paragrahps.shift();
            if (subtitle) {
                var printInfos = text_utils.getLines(copied_context, subtitle, 1100);
                resetIndex = printInfos.no_of_frames;
                frameIndex = 0;
            } else {
                notification_utils.showNotification("Quá trình tạo ảnh cho video kết thúc", "alert-success", "notification-container");
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
            for (var i = 0; i < printInfos.lines.length; i++) {
                var line = printInfos.lines[i];
                text_utils.writeLine(copied_context, line, 1200, startY);
                startY += 50;
            }
        } else {
            resetIndex = 48; // 2 sec to end
        }
    }
}
