const webpack = require('webpack');
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
    mode: isDev ? 'development' : 'production',
    entry: isDev ? 
        {
            game01: ["/src/javascripts/games/01.js", 'webpack-hot-middleware/client'],
            game02: ["/src/javascripts/games/02.js", 'webpack-hot-middleware/client'],
            game03: ["/src/javascripts/games/03.js", 'webpack-hot-middleware/client'],
            common: ["/src/javascripts/common.js", 'webpack-hot-middleware/client']
        } :
        {
            game01: "/src/javascripts/games/01.js",
            game02: "/src/javascripts/games/02.js",
            game03: "/src/javascripts/games/03.js",
            common: "/src/javascripts/common.js",
        } 
    ,
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
        splitChunks: {
            chunks: 'all',
        }
    }
};