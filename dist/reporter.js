'use strict';

var server = require('http').createServer(handler);
var io = require('socket.io')(server);
var portfinder = require('portfinder');
var fs = require('fs');
var url = require('url');
var path = require('path');
var opn = require('opn');

var BrowserReporter = function BrowserReporter(baseReporterDecorator) {
  var _this = this;

  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$port = _ref.port;
  var port = _ref$port === undefined ? 5432 : _ref$port;
  var _ref$ignoreSuccessful = _ref.ignoreSuccessful;
  var ignoreSuccessful = _ref$ignoreSuccessful === undefined ? false : _ref$ignoreSuccessful;
  var _ref$ignoreFailed = _ref.ignoreFailed;
  var ignoreFailed = _ref$ignoreFailed === undefined ? false : _ref$ignoreFailed;
  var _ref$ignoreSkipped = _ref.ignoreSkipped;
  var ignoreSkipped = _ref$ignoreSkipped === undefined ? false : _ref$ignoreSkipped;

  baseReporterDecorator(this);

  var connectedSockets = [];
  var serverReady = void 0,
      browserOpened = void 0,
      messages = [],
      queuedMessages = [];

  startServer(port).then(function (p) {
    port = p;
    serverReady = true;
    queuedMessages.forEach(function (m) {
      return connectedSockets.forEach(function (s) {
        return s.emit('spec', m);
      });
    });
    queuedMessages = [];

    _this.write('karma-browser-reporter served on port ' + port + '\n');
  }).catch(function (err) {
    console.error(err); // eslint-disable-line
  });

  io.on('connection', function (socket) {
    connectedSockets.push(socket);
    messages.forEach(function (m) {
      return socket.emit('spec', m);
    });
    socket.emit('run_complete');
    socket.on('disconnect', function () {
      return connectedSockets.splice(connectedSockets.indexOf(socket), 1);
    });
  });

  this.onRunStart = function () {
    connectedSockets.forEach(function (s) {
      return s.emit('run_start');
    });

    _this._browsers = [];
    messages = [];
    queuedMessages = [];
  };

  this.onRunComplete = function () {
    connectedSockets.forEach(function (s) {
      return s.emit('run_complete');
    });
  };

  this.onBrowserStart = function (b) {
    _this._browsers.push(b);
    if (!browserOpened) {
      opn('http://localhost:' + port + '/');
      browserOpened = true;
    }
  };

  if (!ignoreSuccessful) {
    this.specSuccess = queueOrSend;
  }
  if (!ignoreFailed) {
    this.specFailure = queueOrSend;
  }
  if (!ignoreSkipped) {
    this.specSkipped = queueOrSend;
  }

  function queueOrSend(browser, result) {
    var message = { browser: browser, result: result };

    messages.push(message);

    if (serverReady) {
      connectedSockets.forEach(function (s) {
        return s.emit('spec', message);
      });
    } else {
      queuedMessages.push(message);
    }
  }
};

function startServer(port) {
  return new Promise(function (resolve, reject) {
    portfinder.basePort = port;
    portfinder.getPort(function (err, port) {
      server.listen(port, function (err) {
        if (err) {
          return reject(err);
        }
        resolve(port);
      });
    });
  });
}

function handler(req, res) {
  var _url$parse = url.parse(req.url);

  var pathname = _url$parse.pathname;

  res.writeHead(200);

  if (pathname === '/client.js') {
    fs.createReadStream(path.resolve(__dirname, '../dist/client.js')).pipe(res);
  } else {
    res.end('\n      <!doctype html>\n      <html lang=en>\n        <head>\n          <meta charset=utf-8>\n          <title>Karma Test Results</title>\n          <script src="/client.js"></script>\n        </head>\n        <body>\n        </body>\n      </html>\n    ');
  }
}

BrowserReporter.$inject = ['baseReporterDecorator', 'config.browserReporter'];

module.exports = {
  'reporter:browser': ['type', BrowserReporter]
};
