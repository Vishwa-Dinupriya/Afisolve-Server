const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    if (!req.headers.authentication) {
        return res.status(401).send('Unauthorized request');
    }
    let token = req.headers.authentication.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send('Unauthorized request');
    }
    try {
        let payload = jwt.verify(token, 'secretKey');
        if (!payload) {
            return res.status(401).send('Unauthorized request');
        }
        req.payload = payload;

        next();
    } catch (exception) {
        return res.status(401).send('Unauthorized request');
    }

}

module.exports = {
    verifyToken
}
