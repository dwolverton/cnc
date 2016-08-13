var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var slackAuth = require('./slack-auth');
var api = require('./api')
var app = express();

app.use(express.static(__dirname + '/../public'));
app.use(cookieParser());
app.use(expressSession({
  secret: 'TODO blah blah',
  resave: false,
  saveUninitialized: false
}));
app.set('views', __dirname + '/../views');
app.set('view engine', 'ejs');

slackAuth(app);
api(app);

app.get('/*', function (req, res) {
  res.render('pages/index', { user : req.session.user });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
