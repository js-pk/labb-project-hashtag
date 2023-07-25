const app = require("./app");
const config = require('../express.config')();

process.env.PORT = config.port;

app.listen(process.env.PORT, () => {
    console.log(`Server started with ${config.mode} mode!`);
});