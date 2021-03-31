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
        req.payload = payload; // attach the payload to request
        next();
    } catch (exception) {
        return res.status(401).send('Unauthorized request');
    }

}

function verifyAdmin(req, res, next) {
    try {
        let role = req.payload.role;
        console.log('this is the role: '+ role);
        if (role!='Admin') {
            return res.status(401).send('Unauthorized request');
        }
        next();
    } catch (exception) {
        return res.status(401).send('Unauthorized request');
    }
}

module.exports = {
    verifyToken,
    verifyAdmin
}
