'use strict'

module.exports = (config) => {
  config.set({
    frameworks: ['mocha', 'chai'],

    files: ['demo.spec.js'],

    reporters: ['browser', 'dots'],

    autoWatch: true,

    browsers: ['Chrome'],

    singleRun: false,

    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      require('./dist/reporter')
    ]
  })
}
