const path = require('path');
// var WebpackBuildNotifierPlugin = require('webpack-build-notifier');

module.exports = {
  context: __dirname,
  entry: './lib/index.js',

  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '*']
  },
  devtool: 'source-maps'
};
