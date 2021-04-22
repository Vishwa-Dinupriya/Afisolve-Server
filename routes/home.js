const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const fs = require('fs');

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From users route');
});

router.post('/user-toolbar-display-details', verifyToken, async (request, response) => {
    console.log('request.payload.role: ' + request.payload.role);
    console.log('request.payload.role: ' + request.payload.username);

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_username', sql.VarChar(50), request.payload.username)
            .execute('userToolbarDetails', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    console.log(JSON.stringify(result));
                    let img;
                    try {//get the picture to 'img' from local memory
                        img = fs.readFileSync('./pictures/profile-pictures/' + request.payload.username + '.png', {encoding: 'base64'})
                    } catch (error) {
                        img = fs.readFileSync('./pictures/default-pictures/default-profile-picture.png', {encoding: 'base64'});
                    }
                    response.status(200).send({
                        status: true,
                        firstname: result.recordsets[0][0].firstName,
                        roles: result.recordsets[1],
                        selectedRole: request.payload.role,
                        profilePhoto: img
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
});

router.post('/get-my-profile-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        if (request.body.UserEmail !== request.payload.username) {
            response.status(401).send({
                status: false
            });
        } else {
            pool.request()
                .input('_username', sql.VarChar(50), request.body.UserEmail)
                .execute('getSelectedUserDetails', (error, result) => {
                    if (error) {
                        console.log('cannot run getSelectedUserDetails');
                        response.status(500).send({
                            status: false
                        });
                    } else {
                        if (result.returnValue === 0) {
                            console.log(JSON.stringify(result) + ' 73 home.js');
                            let img;
                            try {//get the picture to 'img' from local memory
                                img = fs.readFileSync('./pictures/profile-pictures/' + request.body.UserEmail + '.png', {encoding: 'base64'})
                            } catch (error) {
                                img = fs.readFileSync('./pictures/profile-pictures/default-profile-picture.png', {encoding: 'base64'});
                            }
                            response.status(200).send({
                                status: true,
                                firstname: result.recordsets[0][0].firstName,
                                lastname: result.recordsets[0][0].lastName,
                                userEmail: result.recordsets[0][0].userEmail,
                                password: result.recordsets[0][0].password,
                                contactNumber: result.recordsets[0][0].contactNumber,
                                activeStatus: result.recordsets[0][0].ativeStatus,
                                generalData: result.recordsets[0],
                                roles: result.recordsets[1],
                                defaultRoleID: result.recordsets[2][0].roleID,
                                profilePhoto: img
                            })
                        } else {
                            console.log('getSelectedUserDetails return -1');
                            response.status(500).send({message: 'return value = -1'});
                        }
                    }
                });
        }
    } catch (e) {
        response.status(500).send(
            {
                status: false
            }
        )
    }
});

router.post('/update-my-profile-details', verifyToken, async (request, response) => {
    const oldEmail = request.body.emailOld;
    const data = request.body.userNewData;
    const adminEmail = request.payload.username;
    const newProfilePhoto = request.body.newProfilePhoto_;
    const clientOtp = request.body.clientOtp;
    const generatedOtpID = request.body.generatedOtpID;

    try {

        const roles = new sql.Table('roles');
        roles.columns.add('role', sql.Int);

        for (const role of data.roles) {
            roles.rows.add(role);
        }

        const pool = await poolPromise;
        await pool.request()
            .input('_oldEmail', sql.VarChar(50), oldEmail)
            .input('_firstname', sql.VarChar(40), data.firstName)
            .input('_lastname', sql.VarChar(40), data.lastName)
            .input('_newEmail', sql.VarChar(50), data.email)
            .input('_password', sql.VarChar(20), data.passwordGroup.password)
            .input('_roles', roles)
            .input('_defaultRole', sql.Int, data.defaultRole)
            .input('_contactNumber', sql.VarChar(20), data.contactNumber)
            .input('_modifiedAdmin', sql.VarChar(50), adminEmail)
            .input('_clientOtp', sql.Int, clientOtp)
            .input('_generatedOtpID', sql.Int, generatedOtpID)
            .execute('updateSelectedUserDetails', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false,
                        message: 'something might went wrong..!'
                    });
                } else {
                    console.log(result);
                    if (result.returnValue === 0) {
                        try {
                            if(!newProfilePhoto) {
                                response.status(200).send({
                                    status: true,
                                    message: 'Data Successfully Updated! Image not found!!'
                                });
                            }else{
                                console.log('Data Successfully Entered!!');

                                //encoding and save the picture to the local memory
                                const path = './pictures/profile-pictures/' + data.email + '.png';
                                const base64Data = newProfilePhoto.replace(/^data:([A-Za-z-+/]+);base64,/, '');
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
                        }catch (error){
                            console.log(error);
                            response.status(500).send({
                                status: false,
                                message: 'Server Error!'
                            });
                        }
                    }else if (result.returnValue === -2) {
                        console.log('stored procedure returned -2');
                        response.status(500).send({message: 'Entered OTP mismatched'});
                    }
                    else if(result.returnValue===-3) {
                        console.log('existing user')
                        response.status(500).send({
                            status: false,
                            message: 'Entered email already exists!'
                        });
                    } else {
                        console.log('2');
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

module.exports = router;
