const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From users route');
});

router.post('/get-user-login-details', verifyToken, async (request, response) => {
    const pool = await poolPromise;
    try {
        pool.request()
            .query('select firstName from USERS where userEmail = \'a@b.com\'', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        firstname: result.recordset[0].firstName
                    })
                }
            });
    } catch (e) {
        response.status(500).send(
            {
                status: false
            }
        )
    }
})

module.exports = router;
