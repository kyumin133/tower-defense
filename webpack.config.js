const path = require('path');
// var WebpackBuildNotifierPlugin = require('webpack-build-notifier');

module.exports = {
  context: __dirname,
  entry: './app/assets/javascripts/index.js',

  output: {
    path: path.resolve(__dirname, 'app', 'assets', 'javascripts'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '*']
  },
  devtool: 'source-maps'
};
