'use strict'

module.exports = {
  entry: ['./src/client/index.js'],

  output: {
    path: 'dist',
    filename: 'client.js'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loader: 'style!css!'
      }
    ]
  }
}
