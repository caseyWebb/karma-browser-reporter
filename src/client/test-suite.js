'use strict'

const _ = require('lodash')
const m = require('mithril')

class TestSuite {
  constructor({
    id,
    name,
    fullName
  }) {
    this.id = id
    this.name = name
    this.fullName = fullName
    this.tests = {}
    this.passed = m.prop(0)
    this.failed = m.prop(0)
    this.skipped = m.prop(0)
  }

  addTest({
    description,
    success,
    skipped,
    time,
    suite: describes,
    assertionErrors: errors
  }) {
    if (skipped) {
      this.skipped(this.skipped() + 1)
    } else if (success) {
      this.passed(this.passed() + 1)
    } else {
      this.failed(this.failed() + 1)
    }

    _.merge(this.tests,
      _.reduce(_.reverse(describes), (test, describe) => ({ [describe]: test }), {
      [description]: {
        description,
        success,
        skipped,
        time,
        errors,
        __is_spec__: true
      }
    }))

    console.dir(this.tests)
  }

  clear() {
    this.passed(0)
    this.failed(0)
    this.skipped(0)
  }
}

module.exports = TestSuite
