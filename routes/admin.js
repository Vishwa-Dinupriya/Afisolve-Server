const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From admin route');
});

router.post('/test', verifyToken, async (request, response) => {
    if (request.payload.role === 'admin') {
        response.status(200).send({
            status: true,
            message: request.payload + ' confirmed you as admin',
        });
    } else {
        response.status(401).send({
            status: false,
            message: request.payload + ' you are not admin'
        })
    }

});

module.exports = router;
