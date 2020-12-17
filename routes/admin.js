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

router.post('/user-details', verifyToken, async (request, response) => {
    console.log(request.payload);
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('username', sql.VarChar(50), request.payload.username)
            .query('SELECT email FROM Users WHERE username = @username', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false,
                        message: 'Server error'
                    });
                } else {
                    console.log(result.recordset);
                    response.status(200).send({
                        status: true,
                        email: result.recordset[0].email
                    });
                }
            });
    } catch (e) {
        response.status(500).send({
            status: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
