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

var slideshows = [];
function addSlideshow(id, json, localize, needGlslTransitions) {
    if (typeof json === "function") {
        slideshows.push({
            id: id,
            enter: json
        });
    } else {
        if (needGlslTransitions) json.transitions = GlslTransitions;
        if (localize) Diaporama.localize(json, localize);
        slideshows.push({
            id: id,
            enter: function (diaporama) {
                diaporama.data = json;
                return function () {};
            }
        });
    }
}
addSlideshow("Ex.3", require("./example3/diaporama.json"), "./example3/", true);

// Socket.io command
socket.on('connect', function(){
    console.log("Socket.io connected");
});
socket.on('article', function(data){
    
});
socket.on('disconnect', function(){});

// Create the Diaporama (empty for now)
var diaporama = Diaporama(document.getElementById("diaporama"), null, {
    autoplay: false,
    loop: false
});
diaporama.on("error", console.error.bind(console));
diaporama.on("load", function () {
    console.log("Slideshow has loaded");
    if (canvas == null) {
        canvas = document.getElementById('diaporamaContainer').querySelector('canvas');
    }
//        canvas = document.querySelector('canvas');
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
    diaporama.play();
    isRecording = true;
    renderVideo();
};
stopBtn.onclick = function () {
    stopAndRenderVideo();
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
                console.log(printInfos);
            }
        }

        requestAnimationFrame(renderVideo);
        
        if (copied_canvas) {
            copied_context.drawImage(canvas, 0, 0);
        }
        
        // Generate text and add here
        // Todo draw text in center horizontal
        var startY = 500;
        if (subtitle) {
            printInfos = text_utils.getLines(copied_context, subtitle, 1100);
            for (var i=0;i< printInfos.lines.length ;i++) {
                var line = printInfos.lines[i];
                copied_context.fillText(line, 70, startY);
                startY += 50;
            }
        }
    }
}


function getLines(ctx, text, maxWidth) {
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
    return lines;
}

function resize() { // Responsive diaporama
    diaporama.width = 1280;
    diaporama.height = 720;
}
resize();

window.diaporama = diaporama;

// Synchronise the current slide

var $currentSlide = document.getElementById("currentSlide");
diaporama.on("slide", function (slide) {
    $currentSlide.textContent = beautify(slide, null, 2, 76);
    window.hljs.highlightBlock($currentSlide);
});

// Slideshows navs
var $slideshows = document.getElementById("slideshows");
var currentSlideshow = 0,
    leave;
slideshows.forEach(function (slideshow, i) {
    var a = document.createElement("a");
    $slideshows.appendChild(a);
    a.target = "_self";
    a.href = "#example/" + i;
    a.textContent = slideshow.id;

    diaporama.on("data", function () {
        if (currentSlideshow === i) {
            a.className = "active";
        } else {
            a.className = "";
        }
    });
    if (i === currentSlideshow) {
        leave = slideshow.enter(diaporama);
    }
});

function syncHash() {
    var maybeExample = (location.hash || "").match("example/([0-9]+)");
    if (maybeExample) {
        var i = parseInt(maybeExample[1]);
        if (currentSlideshow === i) return;
        leave();
        currentSlideshow = i;
        leave = slideshows[i].enter(diaporama);
        diaporama.currentTime = 0;
    }
}
window.addEventListener("hashchange", syncHash);
syncHash();
