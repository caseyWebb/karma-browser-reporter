'use strict'

const server = require('http').createServer(handler)
const io = require('socket.io')(server)
const portfinder = require('portfinder')
const fs = require('fs')
const url = require('url')
const path = require('path')
const opn = require('opn')

const BrowserReporter = function(baseReporterDecorator, {
  port = 5432,
  ignoreSuccessful = false,
  ignoreFailed = false,
  ignoreSkipped = false
} = {}) {
  baseReporterDecorator(this)

  const connectedSockets = []
  let serverReady, browserOpened, messages = [], queuedMessages = []

  startServer(port)
    .then((p) => {
      port = p
      serverReady = true
      queuedMessages.forEach((m) => connectedSockets.forEach((s) => s.emit('spec', m)))
      queuedMessages = []

      this.write(`karma-browser-reporter served on port ${port}\n`)
    })
    .catch((err) => {
      console.error(err) // eslint-disable-line
    })

  io.on('connection', (socket) => {
    connectedSockets.push(socket)
    messages.forEach((m) => socket.emit('spec', m))
    socket.emit('run_complete')
    socket.on('disconnect', () => connectedSockets.splice(connectedSockets.indexOf(socket), 1))
  })

  this.onRunStart = () => {
    connectedSockets.forEach((s) => s.emit('run_start'))

    this._browsers = []
    messages = []
    queuedMessages = []
  }

  this.onRunComplete = () => {
    connectedSockets.forEach((s) => s.emit('run_complete'))
  }

  this.onBrowserStart = (b) => {
    this._browsers.push(b)
    if (!browserOpened) {
      opn(`http://localhost:${port}/`)
      browserOpened = true
    }
  }

  if (!ignoreSuccessful) {
    this.specSuccess = queueOrSend
  }
  if (!ignoreFailed) {
    this.specFailure = queueOrSend
  }
  if (!ignoreSkipped) {
    this.specSkipped = queueOrSend
  }

  function queueOrSend(browser, result) {
    const message =  { browser, result }

    messages.push(message)

    if (serverReady) {
      connectedSockets.forEach((s) => s.emit('spec', message))
    } else {
      queuedMessages.push(message)
    }
  }
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    portfinder.basePort = port
    portfinder.getPort((err, port) => {
      server.listen(port, (err) => {
        if (err) { return reject(err) }
        resolve(port)
      })
    })
  })
}

function handler(req, res) {
  const { pathname } = url.parse(req.url)
  res.writeHead(200)

  if (pathname === '/client.js') {
    fs.createReadStream(path.resolve(__dirname, '../dist/client.js')).pipe(res)
  } else {
    res.end(`
      <!doctype html>
      <html lang=en>
        <head>
          <meta charset=utf-8>
          <title>Karma Test Results</title>
          <script src="/client.js"></script>
        </head>
        <body>
        </body>
      </html>
    `)
  }
}

BrowserReporter.$inject = ['baseReporterDecorator', 'config.browserReporter']

module.exports = {
  'reporter:browser': ['type', BrowserReporter]
}
