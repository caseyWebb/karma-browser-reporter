'use strict'

const m = require('mithril')
const domready = require('domready')

const TestReport = require('./test-report-component')
require('./style.css')

domready(() => m.mount(document.body, TestReport))
