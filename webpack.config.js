const path = require('path')
const webpack = require('webpack')

module.exports = {
  devtool: 'eval',

  entry: [
    'webpack-hot-middleware/client',
    './src/index'
  ],

  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/public/'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: path.join(__dirname, 'node_modules'),
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader?modules&camelCase',
        include: path.join(__dirname, 'src', 'styles'),
      },
      {
        test: /\.png$/,
        loader: 'url-loader?limit=8000',
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
      }
    ]
  }
}
