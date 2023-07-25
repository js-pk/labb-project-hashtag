const webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const compiler = webpack(webpackConfig);
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = require("../src/app");

app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
}));

app.use(webpackHotMiddleware(compiler));
app.listen(3000, () => console.log('http://localhost:3000'));