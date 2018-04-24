var Diaporama = require("diaporama");
var GlslTransitions = require("glsl-transitions");
var beautify = require("json-beautify");
var cvg = require('./cvg.js');
var dateFormat = require('dateformat');

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

// Create the Diaporama (empty for now)
var canvas = null;
var diaporama = Diaporama(document.getElementById("diaporama"), null, {
    autoplay: false,
    loop: false
});
diaporama.on("error", console.error.bind(console));
diaporama.on("load", function () {
    console.log("Slideshow has loaded");
    if (canvas == null)
        canvas = document.querySelector('canvas');
});

diaporama.on("ended", function () {
    console.log("Slideshow is ended");
    stopAndRenderVideo();
});

// Control the diaporama
var isRecording = false;

var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
startBtn.onclick = function () {
    diaporama.play();
    isRecording = true;
    render();
};
stopBtn.onclick = function () {
    stopAndRenderVideo();
};

function stopAndRenderVideo() {
    var now = new Date();
    var fileName = dateFormat(now, "example_" + "yyyymmdd_HHMMss");
    isRecording = false;
    cvg.render(fileName);
}

function render() {
    if (isRecording) {
        cvg.addFrame(canvas);
        requestAnimationFrame(render);
    }
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
