const webpack = require('webpack');
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    mode: isDev ? 'development' : 'production',
    entry: {
        pixi: ['/src/javascripts/games/01/index', '/src/javascripts/games/02/index'],
        ar: ['/src/javascripts/games/03/index'],
        actions: ['/src/javascripts/reward']
    },
    devtool: 'inline-source-map',
    devServer: {
      static: './public',
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