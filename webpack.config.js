const webpack = require('webpack');
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    mode: isDev ? 'development' : 'production',
    entry: {
        game01: ['/src/javascripts/games/01/index'],
        game02: ['/src/javascripts/games/02/index'],
        ar: ['/src/javascripts/games/03/index']
    },
    devtool: 'inline-source-map',
    devServer: {
      static: './public',
      allowedHosts: 'all',
      hot: true,
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    output: {
        filename: 'scripts/[name].js',
        path: __dirname + '/public/'
    },
    optimization: {
        minimize: false
    }
};