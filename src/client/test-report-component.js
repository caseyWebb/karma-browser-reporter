'use strict'

const _ = require('lodash')
const m = require('mithril')
const socket = require('socket.io-client')()

const TestSuite = require('./test-suite')

const TestReport = {
  viewModel: {
    init() {
      socket.on('run_start', TestReport.viewModel.onRunStart)
      socket.on('run_complete', TestReport.viewModel.onRunComplete)
      socket.on('spec', TestReport.viewModel.onSpec)
    },

    onRunStart() {
      TestReport.viewModel.working(true)
      _.each(TestReport.viewModel.browsers, (b) => b.clear())
      m.redraw()
    },

    onRunComplete() {
      TestReport.viewModel.working(false)
      _.each(TestReport.viewModel.browsers, (b) => b.logToConsole())
      m.redraw()
    },

    onSpec({ browser, result }) {
      let b = _.find(TestReport.viewModel.browsers, { id: browser.id })

      if (!b) {
        b = new TestSuite(browser)
        TestReport.viewModel.browsers.push(b)
      }

      b.addTest(result)
      m.redraw()
    },

    toDom(test, describe) {
      return m('div.describe-block', {
        class: test.__is_spec__ ? 'last' : null
      },
      test.__is_spec__
        ? m('span.spec', {
          class:
            test.skipped
              ? 'skip'
              : test.success
                ? 'pass'
                : 'fail'
        }, [
          test.description,
          !test.skipped && !test.success
           ? m('pre.error-block', [
             ..._.map(test.errors, 'message'),
             ..._.map(test.log, (l) => l.trim())
           ].join('\n\n'))
           : null
        ])
        : [
            m('h3.describe-header', describe),
            _.map(test, (t, d) =>
              TestReport.viewModel.toDom(t, d))
          ]
      )
    },

    browsers: [],
    working: m.prop(false)
  },

  controller() {
    TestReport.viewModel.init()
    this.browsers = TestReport.viewModel.browsers
    this.working = TestReport.viewModel.working
  },

  view(ctrl) {
    return _.map(ctrl.browsers, ({
      name,
      fullName,
      tests,
      passed,
      failed,
      skipped
    }) =>  m('div', [
      m('div.counts', [
        ctrl.working()
          ? m('span.working-label', 'working...')
          : [
              m('span.count-label', 'passed:'), m('span.count', passed()),
              m('span.count-label', 'failed:'), m('span.count', failed()),
              m('span.count-label', 'skipped:'), m('span.count', skipped())
            ]
      ]),
      m('h1.browser-header', { title: fullName }, name),
      m('div', _.map(tests, TestReport.viewModel.toDom))
    ]))
  }
}

module.exports = TestReport
