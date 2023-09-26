const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

const compiler = webpack(webpackConfig);
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = require('./app');

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
}));

app.use(webpackHotMiddleware(compiler));
app.listen(80, () => console.log('http://localhost:80'));
