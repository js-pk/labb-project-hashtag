const app = require("./app");

app.listen(process.env.PORT, () => {
    console.log(`Server started with production mode in port:${process.env.PORT}`);
});