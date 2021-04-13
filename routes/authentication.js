const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const fs = require('fs');

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require("../helpers/verifyToken");
const {verifyAdmin} = require('../helpers/verifyToken');

const {Auth} = require('two-step-auth');
const nodemailer = require('nodemailer');

const otpGenerator = require('otp-generator');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vishwagamage808@gmail.com',
        pass: 'Sanju@1223'
    }
});

let generatedOTP;

async function sendOtp(receiverEmail) {
    // You can follow the above approach, But we recommend you to follow the one below, as the mails will be treated as important
    generatedOTP = otpGenerator.generate(8, {digits: true, alphabets: false, upperCase: false, specialChars: false});
    const mailOptions = {
        from: 'vishwagamage808@gmail.com',
        to: receiverEmail,
        subject: 'Sending Email using Node.js',
        text: generatedOTP
    };

    try {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        }).then(r => console.log('then section'))
    } catch (e) {

    }

}


router.get('/', (req, res) => {
    res.send('From authentication route');
});

router.post('/sendOtpToEmail', verifyToken, verifyAdmin, async (request, response) => {

    console.log(request.body);
    const data = request.body;
    try {
        sendOtp('vishwadinupriya@gmail.com').then(r => console.log('success! otp send and stored'));
    } catch (e) {
        console.log(e);
    }

});

router.post('/register', verifyToken, verifyAdmin, async (request, response) => {

    console.log(request.body.otp);
    console.log(generatedOTP);
    const data = request.body.userData;
    const image = request.body.profilePicture;
    const adminEmail = request.payload.username;

    try {

        const roles = new sql.Table('roles');
        roles.columns.add('role', sql.Int);

        for (const role of data.roles) {
            roles.rows.add(role);
        }

        const pool = await poolPromise;
        await pool.request()
            .input('_firstname', sql.VarChar(40), data.firstName)
            .input('_lastname', sql.VarChar(40), data.lastName)
            .input('_email', sql.VarChar(50), data.email)
            .input('_password', sql.VarChar(20), data.passwordGroup.password)
            .input('_roles', roles)
            .input('_defaultRole', sql.Int, data.defaultRole)
            .input('_contactNumber', sql.VarChar(20), data.contactNumber)
            .input('_createdAdmin', sql.VarChar(50), adminEmail)
            .execute('registerUser', (error, result) => {
                if (error) {
                    console.log(error);
                    if (error.number === 2627) {
                        response.status(500).send({
                            status: false,
                            message: 'Existing User'
                        });
                    } else {//vishwa brogen ahanna
                        response.status(500).send({
                            status: false,
                            message: 'query Error..!'
                        });
                    }
                } else {

                    if (result.returnValue === 0) {
                        try {
                            if (!image) {
                                response.status(200).send({
                                    status: false,
                                    message: 'Data Successfully Entered! Image not found!!',
                                    image: null
                                });
                            } else {
                                console.log('Data Successfully Entered!');

                                //encoding and save the picture to the local memory
                                const path = './pictures/profile-pictures/' + request.body.email + '.png';
                                const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                                fs.writeFileSync(path, base64Data, {encoding: 'base64'});

                                //get the picture to 'img' from local memory
                                let img;
                                try {
                                    img = fs.readFileSync('./pictures/profile-pictures/' + request.body.email + '.png', {encoding: 'base64'});
                                } catch (error) {
                                    img = fs.readFileSync('./pictures/profile-pictures/default-profile-picture.png', {encoding: 'base64'});
                                }
                                response.status(200).send({
                                    status: true,
                                    message: 'Data Successfully Entered!',
                                    image: img
                                });
                            }
                        } catch (error) {
                            console.log(error);
                            response.status(500).send({
                                status: false,
                                message: 'Server Error!'
                            });
                        }
                    } else {//vishwa brogen ahanna
                        response.status(500).send({message: 'from error handler'});
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
                        message: 'DB query error..!'
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log('login successful..!');
                        // console.log(JSON.stringify(result, null, 2));
                        // console.log(JSON.stringify(result));
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
                            defaultRole: result.recordsets[0][0].roleName, // default role compo. ekat navigate kranne meken
                            firstname: result.recordsets[1][0].firstName,
                            userEmail: result.recordsets[1][0].username
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
            message: 'DB Connection error..!'
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
                        requestedRole: result.recordsets[0][0].roleName, // role comp. ekat navigate kranne meken
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
