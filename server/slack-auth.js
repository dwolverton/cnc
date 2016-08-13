var request = require('request');
var config = require('./config');

module.exports = function(app) {
  app.use(/^\/(?!slack\/oauth).*/, function (req, res, next) {
    if (!isLoggedIn(req)) {
      loginPage(req, res);
      return;
    }
    next();
  });
  app.get('/slack/oauth', oAuthCallback);
};

function isLoggedIn(req) {
  return req.session && req.session.user;
}

function loginPage(req, res) {
  req.session.preLoginUrl = req.originalUrl;
  res.render('pages/login', {
    clientId: config.slack.clientId,
    teamId: config.slack.teamId }
  );
}

function oAuthCallback(req, res) {
  var code = req.query.code;
  var userInfo = obtainUserLogin(code, function(userInfo) {
    if (userInfo) {
      req.session.user = userInfo;
      res.redirect('/');
    } else {
      res.send("Sorry. Authorization failed.");
    }
  });
}

function obtainUserLogin(code, callback) {
  var result = null;
  request({
    url: "https://slack.com/api/oauth.access?client_id=" + config.slack.clientId +
         "&client_secret=" + config.slack.clientSecret +
         "&code=" + code,
    json: true
  }, function(error, response, body) {
    if (body && body.ok) {
      if (body.team.id === config.slack.teamId) {
        callback({
          id: body.user.id,
          name: body.user.name,
          email: body.user.email
        });
        return;
      }
    } else {
      console.error("slack auth error", error || (body && body.error));
    }
    callback();
  });
}
