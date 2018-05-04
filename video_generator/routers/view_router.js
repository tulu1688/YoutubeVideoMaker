var express = require('express'),
    router = express.Router();

router.get('/videos', function(req, res, next) {
    res.render('videos');
});

module.exports = router;