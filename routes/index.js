var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express();

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/', urlencodedParser, function (req, res) {
    var body = req.body;
    if (!body) return res.sendStatus(400);
    console.log(body);
    return res.sendStatus(200);
    res.render('index', { title: 'Express' });
});

module.exports = router;