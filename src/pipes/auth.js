const twoFactor = require("node-2fa");
const secret = process.env.APP_SECRET;

exports.authenticate = function(req, res) {
    const { token } = req.params;
    res.redirect(`/?token=${token}`);
};

exports.generate = function(req, res) {
    
    const reject = () => {
        res.setHeader("www-authenticate", "Basic");
        res.sendStatus(401);
    };

    const authorization = req.headers.authorization;
    
    if (!authorization) {
        return reject();
    }
    
    const [username, password] = Buffer.from(
        authorization.replace("Basic ", ""),
        "base64"
    ).toString().split(":");
    
    if (!(username === process.env.ADMIN_NAME && password === process.env.ADMIN_PASSWORD)) {
        return reject();
    }
    
    const token = twoFactor.generateToken(secret);
    const urlWithToken = `labbfarm.net/auth/${token.token}`;

    res.render('auth', {
        url: urlWithToken,
    });
};