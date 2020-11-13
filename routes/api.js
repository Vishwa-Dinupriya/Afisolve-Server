const express = require('express')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

router.get('/',(req, res)=>{
    res.send('From API route')
})

router.post('/register', async (request, response) => {

    console.log(request.body);
    const data = request.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('username', sql.VarChar(50), data.userName)
            .input('email',  sql.VarChar(100), data.email)
            .input('subscribe', sql.VarChar(20), data.subscribe)
            .input('password', sql.VarChar(20), data.password)
            .input('city', sql.VarChar(20), data.address.city)
            .input('state', sql.VarChar(20), data.address.state)
            .input('postalCode', sql.VarChar(20), data.address.postalCode)
            .query('INSERT INTO Users VALUES (@username, @email, @subscribe, @password, @city, @state, @postalCode)', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false,
                        message: 'Error..!'
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        message: 'Data Successfully Entered!'
                    });
                }
            });
    } catch (error) {
        console.log(error);
        response.status(500).send({
            status: false,
            message: 'Error..!'
        });
    }

});

router.post('/login', async (request, response) => {
    console.log(request.body);
    const data = request.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('username', sql.VarChar(50), data.userName)
            .input('password', sql.VarChar(20), data.password)
            .query('SELECT username FROM Users WHERE username = @username AND password = @password', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false,
                        message: 'DB Server error..!'
                    });
                } else {
                    if (result.recordset.length !== 0) {
                        console.log('login successful..!');
                        response.status(200).send({
                            status: true,
                            message: 'Login successful..!',
                            username: result.recordset
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

module.exports = router;
