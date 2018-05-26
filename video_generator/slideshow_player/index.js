var Diaporama = require("diaporama");
var GlslTransitions = require("glsl-transitions");
var beautify = require("json-beautify");
var dateFormat = require('dateformat');
var socket = require('socket.io-client')('http://localhost:3172');

var cvg = require('./cvg.js'),
    text_utils = require('./text_utils.js'),
    slide_generator = require('./slide_generator.js'),
    notification_utils = require('./notification_utils.js');

/////////////////////////////////////////////////////////////////////
//
// VARIABLES
//
/////////////////////////////////////////////////////////////////////

// Widgets
var fetchUrlBtn = document.getElementById("fetchUrlBtn");
var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
var urlTxt = document.getElementById("urlTxt");
var titleEdt = document.getElementById("titleEdt");
var descriptionEdt = document.getElementById("descriptionEdt");
var articleContentEditText = document.getElementById("articleContentEditText");

// Article related vars
var paragrahps = [];
var slides = [];
var videoInfoId = null;

// Control the diaporama
var isRecording = false;
var subtitle = '';
var frameIndex = 0;
var globalFrameIndex = 0;
var resetIndex = 48; // 2 sec without subtitle
var isSubtitlePlayed = false;

// Canvases and diaporama
var diaporama = null;
var canvas = null;
var canvasContainer = document.getElementById('canvasContainer');
var copied_canvas = document.getElementById('2dCanvas');
var copied_context = copied_canvas.getContext('2d');
copied_context.font = "45px Verdana";
copied_context.fillStyle = '#fff';
copied_context.shadowColor = '#000';
copied_context.shadowOffsetX = 3;
copied_context.shadowOffsetY = 0;
copied_context.shadowBlur = 10;


/////////////////////////////////////////////////////////////////////
//
// CONTROLS
//
/////////////////////////////////////////////////////////////////////
// Socket.io command
socket.on('connect', function () {
    console.log("Socket.io connected");
});
socket.on('article', function (data) {
    // Reset data when finish crawl any url
    paragrahps = [];
    slides = [];

    if (data.status == 'success') {
        if (data.images.length) {
            slides = slide_generator.generateSlides(data.images);
            slides.transitions = GlslTransitions;
        }

        videoInfoId = data.ref_id;
        
        articleContentEditText.value = data.content;
        descriptionEdt.value = data.description;
        titleEdt.value = data.title;
        
        startBtn.removeAttribute("disabled");
    } else if (data.status == 'fail') {
        articleContentEditText.value = '';
        descriptionEdt.value = '';
        titleEdt.value = '';
        
        startBtn.setAttribute("disabled","true");
        stopBtn.setAttribute("disabled","true");
    }
});
socket.on('disconnect', function () {});

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
        isRecording = false;
        stopAndRenderVideo();
    });

    return diaporama;
}

function resetDiaporama() {
    diaporama.destroy();
    canvas.parentNode.removeChild(canvas);
    canvas = null;
}

fetchUrlBtn.onclick = function () {
    notification_utils.clearNotifications();

    socket.emit("url", {
        url: urlTxt.value
    });
}

startBtn.onclick = function () {
    notification_utils.clearNotifications();

    if (videoInfoId && slides) {
        canvasContainer.style.display = "block";
        fetchUrlBtn.setAttribute("disabled","true");
        stopBtn.removeAttribute("disabled");
        startBtn.setAttribute("disabled","true");
        
        frameIndex = 0;
        globalFrameIndex = 0;
        isSubtitlePlayed = false;
        resetIndex = 48;

        diaporama = setupDiaporama();
        diaporama.data = slides;

        if (articleContentEditText.value)
            paragrahps = text_utils.splitArticleToLines(articleContentEditText.value)

        diaporama.play();
        isRecording = true;
        renderVideo();
    } else {
        notification_utils.showNotification("Nội dung không hợp lệ", "alert-danger", "notification-container");
    }
};

stopBtn.onclick = function () {
    isRecording = false;
    cvg.notifyFinishCapture(videoInfoId, globalFrameIndex);
    stopAndRenderVideo();
};


function stopAndRenderVideo() {
    canvasContainer.style.display = "none";
    fetchUrlBtn.removeAttribute("disabled");
    stopBtn.setAttribute("disabled","true");
    startBtn.setAttribute("disabled","true");
        
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
                if (!isSubtitlePlayed) {
                    resetIndex = 48; // Wait more 2 sec
                    isSubtitlePlayed = true;
                } else {
                    notification_utils.showNotification("Quá trình tạo ảnh cho video kết thúc", "alert-success", "notification-container");

                    cvg.notifyFinishCapture(videoInfoId, globalFrameIndex);
                    stopAndRenderVideo();
                }
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
        }
    }
}
