var express = require('express');
var router = express.Router();
var dao = require('../src/dao');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'rdstation-webhook' });
});

router.get('/rd-webhook', function(req, res, next) {
    var body = req.body;
    if (!body) return res.sendStatus(400);
    var leads = body["leads"];
    for(var lead in leads) {
        dao.save(leads[lead]);
    }
    res.sendStatus(200);
});


module.exports = router;