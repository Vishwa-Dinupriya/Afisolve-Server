const express = require('express')
const jwt = require('jsonwebtoken')
const {verifyToken} = require("../helpers/verifyToken");
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

router.get('/', (req, res) => {
    res.send('From authentication route');
});

router.post('/register', async (request, response) => {

    const data = request.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('_firstname', sql.VarChar(40), data.firstName)
            .input('_lastname', sql.VarChar(40), data.lastName)
            .input('_email', sql.VarChar(50), data.email)
            .input('_password', sql.VarChar(20), data.password)
            .input('_role', sql.VarChar(25), data.role)
            .input('_contactNumber', sql.VarChar(20), data.contactNumber)
            .execute('registerUser', (error, result) => {
                if (error) {
                    console.log(error.number);
                    if (error.number === 2627) {
                        response.status(500).send({
                            status: false,
                            message: 'Existing User'
                        });
                    } else {
                        response.status(500).send({
                            status: false,
                            message: 'query Error..!'
                        });
                    }

                } else {
                    console.log(result);
                    if (result.returnValue === 0) {
                        console.log('Data Successfully Entered!');
                        response.status(200).send({
                            status: true,
                            message: 'Data Successfully Entered!'
                        });
                    } else {
                        response.status(500).send({message: 'DB Server Error'});
                    }
                }
            });
    } catch (error) {
        console.log(error);
        response.status(500).send({
            status: false,
            message: 'DB connection Error..!'
        });
    }

});

router.post('/login', async (request, response) => {
    console.log(request.body);
    const data = request.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('_email', sql.VarChar(50), data.email)
            .input('_password', sql.VarChar(20), data.password)
            .execute('login', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false,
                        message: 'DB Server error..!'
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log('login successful..!');
                        // console.log(JSON.stringify(result, null, 2));
                        console.log(JSON.stringify(result));
                        // console.log(result.recordsets[1]);
                        // console.log( result.recordsets[0][0]);

                        let payload = {
                            username: result.recordsets[1][0].username,
                            role: result.recordsets[0][0].roleName //aye backend ekata enne meka
                        }

                        let token = jwt.sign(payload, 'secretKey')
                        response.status(200).send({
                            status: true,
                            message: 'Login successful..!',
                            dbResult: result.recordsets[1],
                            token: token,
                            role: result.recordsets[0][0].roleName, // default role comp. ekat navigate kranne meken
                            firstname: result.recordsets[1][0].firstName
                        })
                    } else {
                        console.log('Invalid username or password');

                        response.status(401).send({
                            status: false,
                            message: 'Invalid username or password'
                        })
                    }
                }
            });

    } catch (error) {
        console.log(error);
        response.status(500).send({
            status: false,
            message: 'Server error..!'
        });
    }

});

router.post('/role-change', verifyToken, async (request, response) => {
    console.log(request.payload.username);
    console.log(request.body.roleName);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_username', sql.VarChar(50), request.payload.username)
            .input('_requestedRole', sql.VarChar(25), request.body.roleName)
            .execute('roleChange', (error, result) => {
                if (result.returnValue === 0) {
                    console.log('Role changing successful..!');
                    let payload = {
                        username: result.recordsets[1][0].username,
                        role: result.recordsets[0][0].roleName //aye backend ekata enne meka
                    }

                    let token = jwt.sign(payload, 'secretKey')
                    response.status(200).send({
                        status: true,
                        message: 'Role changing successful..!',
                        token: token,
                        role: result.recordsets[0][0].roleName, // role comp. ekat navigate kranne meken
                    })
                } else {
                    console.log('Unauthorized role');

                    response.status(401).send({
                        status: false,
                        message: 'Unauthorized role'
                    })
                }
            });
    } catch (error) {
        console.log(error);
        response.status(500).send({
            status: false,
            message: 'Server error..!'
        });
    }
});

module.exports = router;
