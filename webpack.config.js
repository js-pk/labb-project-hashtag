const webpack = require('webpack');
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
    mode: isDev ? 'development' : 'production',
    entry: isDev ? 
        {
            'games/01': ["/src/javascripts/games/01.js", 'webpack-hot-middleware/client'],
            'games/02': ["/src/javascripts/games/02.js", 'webpack-hot-middleware/client'],
            'games/03': ["/src/javascripts/games/03.js", 'webpack-hot-middleware/client'],
        } :
        {
            'games/01': "/src/javascripts/games/01.js",
            'games/02': "/src/javascripts/games/02.js",
            'games/03': "/src/javascripts/games/03.js",
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
    }
};