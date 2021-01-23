const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');


router.post('/user-details', verifyToken, async (request, response) => {
    console.log(request.payload);
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('username', sql.VarChar(50), request.payload.username)
            .query('SELECT firstName FROM users WHERE userEmail = @username', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false,
                        message: 'Server error'
                    });
                } else {
                    console.log(result.recordset);
                    response.status(200).send({
                        status: true,
                        firstName: result.recordset[0].firstName
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
