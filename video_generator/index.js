var bodyParser = require('body-parser'),
    express = require('express'),
    config = require('config');

var router = require('./routers'),  
    client_handler = require('./socket_client_handler.js');

var PORT = config.get('app.port') || 3172;
var APIVERSION = config.get('app.apiVersion');


var app = express();
var http = require('http').Server(app);

app.use(function (req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '100mb'
}));
app.use(express.json());
app.use(express.static('images'))

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Routing
app.use('/' + APIVERSION, router.api);
app.use('/', router.view);

var io = require('socket.io')(http);
io.set('origins', '*:*');
io.sockets.on('connection', client_handler);

http.listen(PORT, function () {
    console.log("Canvas video generator server listening on port " + PORT + ".");
});
