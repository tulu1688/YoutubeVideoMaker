var express = require('express'),
    router = express.Router();

router.api = require('./api_router.js');
router.view = require('./view_router.js');

module.exports = router;