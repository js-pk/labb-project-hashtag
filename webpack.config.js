const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    mode: isDev ? 'development' : 'production',
    entry: {
        pixi: ['/src/javascripts/games/01', '/src/javascripts/games/02'],
        ar: ['/src/javascripts/games/03']
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
    }
};