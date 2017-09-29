const path = require('path')
const webpack = require('webpack')
const config = require('./webpack.config');

config.devtool = 'source-map',

config.entry = [
  './src/index'
];

 config.output = {
  path: path.join(__dirname, 'public'),
  filename: 'bundle.js',
  publicPath: '/public/'
};

config.plugins = [
  new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    compress: {
      warnings: false
    }
  }),
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  })
];

module.exports = config;
