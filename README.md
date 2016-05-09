# karma-browser-reporter

![NPM](https://img.shields.io/npm/v/karma-browser-reporter.svg)
![WTFPL](https://img.shields.io/npm/l/karma-browser-reporter.svg)
[![Code Climate](https://img.shields.io/codeclimate/github/caseyWebb/karma-browser-reporter.svg?maxAge=2592000)]()
[![David](https://img.shields.io/david/caseyWebb/karma-browser-reporter.svg?maxAge=2592000)]()
[![David](https://img.shields.io/david/dev/caseyWebb/karma-browser-reporter.svg?maxAge=2592000)]()

<p align="center">
  <img src="demo.png" alt="demo" />
</p>

### Configuration

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['browser'],

    plugins: [
      'karma-browser-reporter'
    ],

    browserReporter: {
      port: 5432,
      ignoreSuccessful: false,
      ignoreFailed: false,
      ignoreSkipped: false
    }
  })
}
```
