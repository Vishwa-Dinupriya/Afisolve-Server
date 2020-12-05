function verifyToken(req, res, next) {
    if (!req.headers.authentication) {
        return res.status(401).send('Unauthorized request');
    }
    let token = req.headers.authentication.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send('Unauthorized request');
    }
    let payload = jwt.verify(token, 'secretKey');
    if (!payload) {
        return res.status(401).send('Unauthorized request');
    }
    req.payload = payload;

    next();
}

module.exports = {
    verifyToken
}
