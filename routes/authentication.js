const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcrypt');

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require("../helpers/verifyToken");
const {verifyAdmin} = require('../helpers/verifyToken');

const {generatedOTP} = require("../helpers/otpService");
const {sendOtp} = require("../helpers/otpService");

router.get('/', (req, res) => {
    res.send('From authentication route');
});

router.post('/sendOtpToEmail', async (request, response) => {
    console.log(request.body);
    const data = request.body;
    let otpID;
    try {
        await sendOtp(request.body.userEnteredEmail, (error, value) => {
            if (error) {
                console.log(error);
            } else {
                console.log('success! otp send and stored! otp ID:' + value);
                response.status(200).send({
                    status: true,
                    message: 'success! otp send and stored!',
                    otpID: value
                });
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/register', verifyToken, verifyAdmin, async (request, response) => {
    console.log(request.body);

    const data = request.body.userData;
    const image = request.body.userData.profilePicture;
    const adminEmail = request.payload.username;
    const otpClient = request.body.otp;
    const generatedOtpID = request.body.otpID;

    try {
        const roles = new sql.Table('roles');
        roles.columns.add('role', sql.Int);

        for (const role of data.roles) {
            roles.rows.add(role);
        }

        bcrypt.hash(data.passwordGroup.password, 10, async (error, hash) => {
            if (error) {
                console.log(error);
                response.status(500).send({
                    status: false,
                    message: 'Something went wrong!'
                });
            } else {
                const pool = await poolPromise;
                await pool.request()
                    .input('_firstname', sql.VarChar(40), data.firstName)
                    .input('_lastname', sql.VarChar(40), data.lastName)
                    .input('_email', sql.VarChar(50), data.email)
                    .input('_password', sql.VarChar(100), hash)
                    .input('_roles', roles)
                    .input('_defaultRole', sql.Int, data.defaultRole)
                    .input('_contactNumber', sql.VarChar(20), data.contactNumber)
                    .input('_createdAdmin', sql.VarChar(50), adminEmail)
                    .input('_clientOtp', sql.Int, otpClient)
                    .input('_generatedOtpID', sql.Int, generatedOtpID)
                    .execute('registerUser', (error, result) => {
                        if (error) {
                            console.log(error);
                            if (error.number === 2627) {
                                response.status(500).send({
                                    status: false,
                                    message: 'Entered email already exists'
                                });
                            } else {//query Error..!
                                response.status(500).send({
                                    status: false,
                                    message: 'something might went wrong..!'
                                });
                            }
                        } else {

                            if (result.returnValue === 0) {
                                try {
                                    if (!image) {
                                        console.log('Data Successfully Entered! Image not found!!');
                                        response.status(200).send({
                                            status: false,
                                            message: 'Data Successfully Entered! Image not found!!',
                                            image: fs.readFileSync('./pictures/profile-pictures/default-profile-picture.png', {encoding: 'base64'})
                                        });
                                    } else {
                                        console.log('Data Successfully Entered!');

                                        //encoding and save the picture to the local memory
                                        const path = './pictures/profile-pictures/' + request.body.userData.email + '.png';
                                        const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                                        fs.writeFileSync(path, base64Data, {encoding: 'base64'});

                                        //get the picture to 'img' from local memory
                                        let img;
                                        try {
                                            img = fs.readFileSync('./pictures/profile-pictures/' + request.body.userData.email + '.png', {encoding: 'base64'});
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
                            } else if (result.returnValue === -2) {
                                console.log('otp not equal')
                                response.status(500).send({
                                    status: false,
                                    message: 'invalid OTP(one-time-password) code!'
                                });
                            } else if (result.returnValue === -3) {
                                console.log('existing user')
                                response.status(500).send({
                                    status: false,
                                    message: 'Entered email already exists!'
                                });
                            } else {
                                response.status(500).send({
                                    status: false,
                                    message: 'error! but not from error handler'
                                });
                            }
                        }
                    });

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
    const data = request.body;

    // bcrypt.hash('123456', 10, (error, hash) => {
    //     if (error) {
    //         console.log('error');
    //     } else {
    //         console.log('encrypted password: ', hash);
    //     }
    // })

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('username', sql.VarChar(20), data.email)
            .execute('checkUsername', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false,
                        message: 'DB query error..!'
                    });

                } else {
                    if (result.returnValue === 0) {
                        console.log(result.recordsets);
                        bcrypt.compare(data.password, result.recordsets[1][0].password, async (error, res) => {
                            if (error) {
                                console.log(error);
                                response.status(500).send({
                                    status: false,
                                    message: 'Something went wrong!'
                                });
                            } else {
                                if (!res) {
                                    // password invalid
                                    console.log('not matched with hash, password invalid');
                                    response.status(401).send({
                                        status: false,
                                        message: 'Invalid Password!'
                                    });
                                } else {
                                    console.log('Password matched with hash successfully!. ');
                                    let payload = {
                                        userID: result.recordsets[1][0].userID,
                                        username: result.recordsets[1][0].username,
                                        role: result.recordsets[0][0].roleName //aye backend ekata enne meka
                                    }
                                    // console.log(payload);

                                    let token = jwt.sign(payload, 'secretKey')
                                    const res = {
                                        status: true,
                                        message: 'Login successful..!',
                                        dbResult: result.recordsets[1],
                                        token: token,
                                        defaultRole: result.recordsets[0][0].roleName, // default role compo. ekat navigate kranne meken
                                        firstname: result.recordsets[1][0].firstName,
                                        userEmail: result.recordsets[1][0].username,
                                        userID: result.recordsets[1][0].userID,
                                    }
                                    await pool.request()
                                        .input('userID', sql.Int, result.recordsets[1][0].userID)
                                        .input('lastActive', sql.BigInt, +new Date())
                                        .execute('updateOrCreateSession', (error, result) => {
                                            if (error) {
                                                response.status(500).send({
                                                    status: false,
                                                    message: 'Server error'
                                                });
                                            } else {
                                                response.status(200).send(res);
                                            }
                                        });

                                }
                            }
                        });

                    } else {
                        // invalid username/email
                        console.log('invalid username');
                        response.status(401).send({
                            status: false,
                            message: 'Username you entered not registered with Afisolve!'
                        });
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

router.post('/forget-password', async (request, response) => {
    console.log(request.body);

    const newPassword = request.body.newPassword;
    const otpClient = request.body.otp;
    const generatedOtpID = request.body.otpID;

    try {
        bcrypt.hash(newPassword, 10, async (error, hash) => {
            if (error) {
                console.log(error);
                response.status(500).send({
                    status: false,
                    message: 'Something went wrong!'
                });
            } else {
                const pool = await poolPromise;
                await pool.request()
                    .input('_email', sql.VarChar(50), request.body.forgetPasswordEmail)
                    .input('_newPassword', sql.VarChar(100), hash)
                    .input('_clientOtp', sql.Int, otpClient)
                    .input('_generatedOtpID', sql.Int, generatedOtpID)
                    .execute('changePasswordOfUser', (error, result) => {
                        if (error) { //query Error..!
                            console.log(error);
                            response.status(500).send({
                                status: false,
                                message: 'something might went wrong..!'
                            });

                        } else {
                            if (result.returnValue === 0) {
                                console.log('Password reset successfully!')
                                response.status(200).send({
                                    status: true,
                                    message: 'Password reset successfully!'
                                });
                            } else if (result.returnValue === -2) {
                                console.log('Client otp and generated otp mismatched ')
                                response.status(500).send({
                                    status: false,
                                    message: 'OTP(one-time-password) code mismatched!'
                                });
                            } else if (result.returnValue === -3) {
                                console.log('existing user')
                                response.status(500).send({
                                    status: false,
                                    message: 'Entered email is not exist! '
                                });
                            } else {
                                console.log('error! but not from error handler');
                                response.status(500).send({
                                    status: false,
                                    message: 'Something might went wrong!'
                                });
                            }
                        }
                    });
            }
        });
    } catch
        (error) {
        console.log(error);
        response.status(500).send({
            status: false,
            message: 'DB connection Error..!'
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
                    console.log(JSON.stringify(result));
                    console.log('Role changing successful..!');
                    let payload = {
                        userID: result.recordsets[1][0].userID,
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

router.post('/change-own-password', verifyToken, async (request, response) => {
    console.log(request.body);
    console.log(request.payload.username);

    const newPassword = request.body.newPassword;
    const otpClient = request.body.otp;
    const generatedOtpID = request.body.otpID;

    try {
        bcrypt.hash(newPassword, 10, async (error, hash) => {
            if (error) {
                console.log(error);
                response.status(500).send({
                    status: false,
                    message: 'Something went wrong!'
                });
            } else {
                const pool = await poolPromise;
                await pool.request()
                    .input('_email', sql.VarChar(50), request.body.changePasswordEmail)
                    .input('_newPassword', sql.VarChar(100), hash)
                    .input('_clientOtp', sql.Int, otpClient)
                    .input('_generatedOtpID', sql.Int, generatedOtpID)
                    .execute('changePasswordOfUser', (error, result) => {
                        if (error) { //query Error..!
                            console.log(error);
                            response.status(500).send({
                                status: false,
                                message: 'something might went wrong..!'
                            });

                        }  else {
                            if (result.returnValue === 0) {
                                console.log('Password reset successfully!')
                                response.status(200).send({
                                    status: true,
                                    message: 'Password reset successfully!'
                                });
                            } else if (result.returnValue === -2) {
                                console.log('Client otp and generated otp mismatched ')
                                response.status(500).send({
                                    status: false,
                                    message: 'OTP(one-time-password) code mismatched!'
                                });
                            } else if (result.returnValue === -3) {
                                console.log('existing user')
                                response.status(500).send({
                                    status: false,
                                    message: 'Entered email is not exist! '
                                });
                            } else {
                                console.log('error! but not from error handler');
                                response.status(500).send({
                                    status: false,
                                    message: 'Something might went wrong!'
                                });
                            }
                        }
                    });
            }
        });
    } catch
        (error) {
        console.log(error);
        response.status(500).send({
            status: false,
            message: 'DB connection Error..!'
        });
    }
});

module.exports = router;
