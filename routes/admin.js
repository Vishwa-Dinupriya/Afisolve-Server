const express = require('express')
const jwt = require('jsonwebtoken')
const fs = require("fs");
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');
const {verifyAdmin} = require('../helpers/verifyToken');

const otpService = require('../helpers/otpService');
const {sendOtp} = require("../helpers/otpService");
const nodemailer = require('nodemailer');

//------------------------------------------users-----------------------------------------------
router.get('/', (req, res, next) => {
    res.send('From admin route');
})

router.post('/get-all-users-details', verifyToken, verifyAdmin, async (request, response) => {
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_username', sql.VarChar(50), request.payload.username)
            .query('select userID, roleID from USER_ROLE' +
                ' select * from  USERS  where userEmail != @_username \n', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    // console.log(JSON.stringify(result));
                    const users = result.recordsets[1];
                    const userRoles = result.recordsets[0];

                    for (let user of users) {
                        user.roleIDs = userRoles.filter(role => role.userID === user.userID).map(r => r.roleID);
                    }

                    // console.log(users);
                    response.status(200).send({
                        status: true,
                        data: users,
                    });

                }
            });
    } catch (e) {
        consoel.log(error);
        response.status(500).send({status: false});
    }
});

router.post('/get-users-details-brief', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from USERS where USERS.activeStatus = \'true\'', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-selected-user-profile-details', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_username', sql.VarChar(50), request.body.selectedUserEmail)
            .execute('getSelectedUserDetails', (error, result) => {
                if (error) {
                    console.log('cannot run getSelectedUserDetails');
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    // console.log(JSON.stringify(result));
                    if (result.returnValue === 0) {
                        // console.log(JSON.stringify(result) + ' 75 admin.js');
                        let img;
                        try {//get the picture to 'img' from local memory
                            img = fs.readFileSync('./pictures/profile-pictures/' + result.recordsets[0][0].userID + '.png', {encoding: 'base64'})
                        } catch (error) {
                            img = fs.readFileSync('./pictures/profile-pictures/default-profile-picture.png', {encoding: 'base64'});
                        }

                        let productsDetails = [];
                        for (let n = 3; n <= 6; n++) {
                            if (result.recordsets[n]) {
                                for (let i = 0; i < result.recordsets[n].length; i++) {
                                    productsDetails.push(result.recordsets[n][i])
                                }
                            }
                        }
                        // console.log(productDetails);
                        // console.log(JSON.stringify(productDetails));
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
                            profilePhoto: img,
                            productsDetails
                        })

                    } else {
                        console.log('getSelectedUserDetails return -1');
                        response.status(500).send({message: 'return value = -1'});
                    }
                }
            })
        ;
    } catch (e) {
        response.status(500).send(
            {
                status: false
            }
        )
    }
});

router.post('/update-selected-user-profile-details', verifyToken, verifyAdmin, async (request, response) => {
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
                    // console.log(JSON.stringify(result) + ' 168 admin.js');
                    if (result.returnValue === 0) {
                        try {
                            if (!newProfilePhoto) {
                                response.status(200).send({
                                    status: true,
                                    message: 'Data Successfully Updated! Image not found!!'
                                });
                            } else {
                                console.log('Data Successfully Entered!!');

                                //encoding and save the picture to the local memory
                                const path = './pictures/profile-pictures/' + result.recordsets[0][0].userID + '.png';
                                const base64Data = newProfilePhoto.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                                fs.writeFileSync(path, base64Data, {encoding: 'base64'});

                                //get the picture to 'img' from local memory
                                let img;
                                try {
                                    img = fs.readFileSync('./pictures/profile-pictures/' + result.recordsets[0][0].userID + '.png', {encoding: 'base64'});
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
                        console.log('stored procedure returned -2');
                        response.status(500).send({message: 'Entered OTP mismatched'});
                    } else if (result.returnValue === -3) {
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

router.post('/change-selected-user-password', verifyToken, verifyAdmin, async (request, response) => {
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

router.post('/delete-selected-user', verifyToken, verifyAdmin, async (request, response) => {

    console.log(request.payload.username + ' 61 admin.js');
    console.log(request.body.selectedUserEmail + ' 62 admin.js');
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_username', sql.VarChar(50), request.body.selectedUserEmail)
            .execute('deleteSelectedUser', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        response.status(200).send({
                            status: true,
                            message: 'User deleted succssfully!'
                        });
                    } else if (result.returnValue === -2) {
                        response.status(500).send({
                            status: false,
                            message: 'This user acting as a customer with a product or several products',
                            productsDetails: result.recordsets[0]
                        });
                    } else if (result.returnValue === -3) {
                        response.status(500).send({
                            status: false,
                            message: 'This user acting as a account-coordinator with a product or several products',
                            productsDetails: result.recordsets[0]
                        });
                    } else if (result.returnValue === -4) {
                        response.status(500).send({
                            status: false,
                            message: 'This user acting as a project-manager with a product or several products',
                            productsDetails: result.recordsets[0]
                        });
                    } else if (result.returnValue === -5) {
                        response.status(500).send({
                            status: false,
                            message: 'This user acting as a developer with a product or several products.',
                            productsDetails: result.recordsets[0]
                        });
                    } else {
                        console.log('return -1 ');
                        response.status(500).send({
                            status: false,
                            message: 'Something went wrong!'
                        });
                    }
                }
            })
        ;
    } catch (e) {
        console.log(e);
        response.status(500).send(
            {
                status: false
            }
        )
    }
});


//----------------------------------------complaints--------------------------------------------

router.post('/get-complaints-details-brief', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select TOP 5 * from COMPLAINT', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-all-complaints', verifyToken, verifyAdmin, async (request, response) =>  {

    const pool = await poolPromise;
    try {
        pool.request()
            .query(' select * from COMPLAINT C  where C.subComplaintID != 0 \n' +
                ' select * from COMPLAINT C  where C.subComplaintID = 0 \n', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    // console.log(JSON.stringify(result) + ' 248 admin.js');
                    let complaintElements = [];
                    for (let i = 0; i < result.recordsets[1].length; i++) {
                        complaintElements[i] = {
                            complaintID: result.recordsets[1][i].complaintID,
                            description: result.recordsets[1][i].description,
                            finishedDate: result.recordsets[1][i].finishedDate,
                            lastDateOfPending: result.recordsets[1][i].lastDateOfPending,
                            productID: result.recordsets[1][i].productID,
                            status: result.recordsets[1][i].status,
                            subComplaintID: result.recordsets[1][i].subComplaintID,
                            submittedDate: result.recordsets[1][i].submittedDate,
                            wipStartDate: result.recordsets[1][i].wipStartDate,
                            subComplaints: result.recordsets[0].filter(function (element) {
                                return element.complaintID === result.recordsets[1][i].complaintID;
                            })
                        }
                    }
                    // console.log(complaintElements);

                    response.status(200).send({
                        status: true,
                        data: complaintElements,
                        subComplaints: result.recordsets[0],
                        mainComplaints: result.recordsets[1],
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-selected-complaint-details', verifyToken, verifyAdmin, async (request, response) => {
    // console.log(' complaintID: ' + request.body.complaintID);
    // console.log(' subComplaintID: ' + request.body.subComplaintID);

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.body.complaintID)
            .input('_subComplaintID', sql.Int, request.body.subComplaintID)
            .execute('getSelectedComplaintDetailsAdmin', (error, result) => {
                if (error) {
                    console.log('cannot run getSelectedComplaintDetailsAdmin');
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        // console.log(JSON.stringify(result) + ' 322 admin.js');
                        let images = [];
                        const nImages = result.recordsets[6].length;
                        for (let i = 0; i < nImages; i++) {
                            let img;
                            try {//get the picture to 'img' from local memory
                                img = fs.readFileSync('./pictures/complaint-pictures/' + result.recordsets[6][i].imageName, {encoding: 'base64'})
                            } catch (error) {
                                img = fs.readFileSync('./pictures/complaint-pictures/default-complaint-picture.png', {encoding: 'base64'});
                            }
                            images.push(img);
                        }
                        response.status(200).send({
                            status: true,
                            data: {
                                complaintID: result.recordsets[0][0].complaintID,
                                subComplaintID: result.recordsets[0][0].subComplaintID,
                                description: result.recordsets[0][0].description,
                                statusID: result.recordsets[0][0].status,
                                submittedDate: result.recordsets[0][0].submittedDate,
                                lastDateOfPending: result.recordsets[0][0].lastDateOfPending,
                                wipStartDate: result.recordsets[0][0].wipStartDate,
                                finishedDate: result.recordsets[0][0].finishedDate,
                                productID: result.recordsets[0][0].productID,
                                statusName: result.recordsets[1][0].statusName,
                                productName: result.recordsets[2][0].productName,
                                projectManagerEmail: result.recordsets[3][0].userEmail,
                                projectManagerFirstName: result.recordsets[3][0].firstName,
                                projectManagerLastName: result.recordsets[3][0].lastName,
                                accountCoordinatorEmail: result.recordsets[4][0].userEmail,
                                accountCoordinatorFirstName: result.recordsets[4][0].firstName,
                                accountCoordinatorLastName: result.recordsets[4][0].lastName,
                                customerEmail: result.recordsets[5][0].userEmail,
                                customerFirstName: result.recordsets[5][0].firstName,
                                customerLastName: result.recordsets[5][0].lastName
                            },
                            images: images
                        })
                    } else {
                        console.log('getSelectedComplaintDetailsAdmin return -1');
                        response.status(500).send({message: 'return value = -1'});
                    }
                }
            })
        ;
    } catch (e) {
        response.status(500).send(
            {
                status: false
            }
        )
    }
});

router.post('/delete-selected-complaint', verifyToken, verifyAdmin, async (request, response) => {

    console.log(request.body);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.body.complaintID)
            .execute('deleteSelectedComplaint', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log(JSON.stringify(result));
                        // delete comment attachments from local memory
                        if (result.recordsets[0] && result.recordsets[0].length !== 0) {
                            for (let i = 0; i < result.recordsets[0].length; i++) {
                                const path = './pictures/comment-pictures/' + result.recordsets[0][i].textOrImageName;
                                try {
                                    fs.unlinkSync(path);
                                    //file removed
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        }
                        // delete complaint attachments from local memory
                        if (result.recordsets[1] && result.recordsets[1].length !== 0) {
                            for (let i = 0; i < result.recordsets[1].length; i++) {
                                const path = './pictures/complaint-pictures/' + result.recordsets[1][i].imageName;
                                try {
                                    fs.unlinkSync(path);
                                    //file removed
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        }
                        response.status(200).send({
                            status: true,
                            message: 'Complaint deleted successfully!'
                        });
                    } else if (result.returnValue === -2) {
                        console.log('return -2 ');
                        response.status(500).send({
                            status: false,
                            message: 'Something went wrong! (return value = -2)'
                        });
                    } else {
                        console.log('return -1 ');
                        response.status(500).send({
                            status: false,
                            message: 'Something went wrong! (return value = -1)'
                        });
                    }
                }
            })
    } catch (e) {
        console.log(e);
        response.status(500).send(
            {
                status: false
            }
        )
    }
});


//------------------------------------------products--------------------------------------------
router.post('/register-product', verifyToken, verifyAdmin, async (request, response) => {

    const data = request.body;
    const requestedAdminEmail = request.payload.username;
    try {
        const developers = new sql.Table('developers');
        developers.columns.add('developer', sql.Int);

        for (const developer of data.developers) {
            developers.rows.add(developer);
        }
        // console.log(developers);
        const pool = await poolPromise;
        pool.request()
            .input('_productName', sql.VarChar(40), data.productName)
            .input('_category', sql.VarChar(20), data.productCategory)
            .input('_customerEmail', sql.VarChar(50), data.customerEmail)
            .input('_projectManagerEmail', sql.VarChar(50), data.projectManagerEmail)
            .input('_accountCoordinatorEmail', sql.VarChar(50), data.accountCoordinatorEmail)
            .input('_createdAdmin', sql.VarChar(50), requestedAdminEmail)
            .input('_developers', developers)
            .execute('registerProduct', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else if (result.returnValue === -1) {
                    console.log('registerProduct return -1')
                    response.status(500).send({
                        status: false,
                        message: ''
                    });
                } else if (result.returnValue === -2) {
                    response.status(500).send({
                        status: false,
                        message: 'Invalid customer!'
                    });
                } else if (result.returnValue === -3) {
                    response.status(500).send({
                        status: false,
                        message: 'Invalid account-coordinator!'
                    });
                } else if (result.returnValue === -4) {
                    response.status(500).send({
                        status: false,
                        message: 'Invalid project-manager'
                    });
                } else if (result.returnValue === -5) {
                    response.status(500).send({
                        status: false,
                        message: 'Invalid developer'
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        console.log(e);
        response.status(500).send(
            {status: false}
        );
    }
});

//------------------------------------------get developers for-products------------------------------------------------------------------------------------------
router.post('/get-all-developers', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            // .input('_customerEmail', sql.VarChar(50), request.payload.username)
            .query('select userID, userEmail from developers', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    console.log(JSON.stringify(result) + ' 75 admin.js');
                    response.status(200).send({
                        status: true,
                        data: result.recordset,
                    });
                }
            });
    } catch (e) {
        console.log(e);
        response.status(500).send({status: false});
    }
});

router.post('/get-all-products', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from PRODUCT \n' + 'select * from USERS', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    // console.log(JSON.stringify(result) + ' 625 admin.js');

                    let productElements = [];
                    for (let i = 0; i < result.recordsets[0].length; i++) {
                        productElements[i] = {
                            productID: result.recordsets[0][i].productID,
                            productName: result.recordsets[0][i].productName,
                            category: result.recordsets[0][i].category,
                            createdAt: result.recordsets[0][i].createdAt,
                            modifiedAt: result.recordsets[0][i].modifiedAt,
                            customerEmail: result.recordsets[1].filter(element => element.userID === result.recordsets[0][i].customerID).map(user => user.userEmail)[0],
                            accountCoordinatorEmail: result.recordsets[1].filter(element => element.userID === result.recordsets[0][i].accountCoordinatorID).map(user => user.userEmail)[0],
                            projectManagerEmail: result.recordsets[1].filter(element => element.userID === result.recordsets[0][i].projectManagerID).map(user => user.userEmail)[0],
                            createdBy: result.recordsets[1].filter(element => element.userID === result.recordsets[0][i].createdBy).map(user => user.userEmail)[0],
                            modifiedBy: result.recordsets[1].filter(element => element.userID === result.recordsets[0][i].modifiedBy).map(user => user.userEmail)[0]
                        }
                    }
                    // console.log(productElements);
                    response.status(200).send({
                        status: true,
                        data: productElements
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-selected-product-details', verifyToken, verifyAdmin, async (request, response) => {
    console.log(' productID: ' + request.body.productID);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_productID', sql.Int, request.body.productID)
            .execute('getSelectedProductDetails', (error, result) => {
                if (error) {
                    console.log('cannot run getSelectedProductDetails');
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        // console.log(JSON.stringify(result) + ' 434 admin.js');
                        // console.log(result.recordsets[4]);
                        response.status(200).send({
                            status: true,
                            data: {
                                accountCoordinatorEmail: result.recordsets[3][0].accountCoordinatorEmail,
                                accountCoordinatorFirstName: result.recordsets[3][0].firstName,
                                accountCoordinatorLastName: result.recordsets[3][0].lastName,
                                category: result.recordsets[0][0].category,
                                createdAt: result.recordsets[0][0].createdAt,
                                createdBy: result.recordsets[0][0].createdBy,
                                customerEmail: result.recordsets[1][0].customerEmail,
                                customerFirstName: result.recordsets[1][0].firstName,
                                customerLastName: result.recordsets[1][0].lastName,
                                modifiedAt: result.recordsets[0][0].modifiedAt,
                                modifiedBy: result.recordsets[0][0].modifiedBy,
                                productID: result.recordsets[0][0].productID,
                                productName: result.recordsets[0][0].productName,
                                projectManagerEmail: result.recordsets[2][0].projectManagerEmail,
                                projectManagerFirstName: result.recordsets[2][0].firstName,
                                projectManagerLastName: result.recordsets[2][0].lastName,
                                complaintsDetails: result.recordsets[4],
                                dev: result.recordsets[5]
                            }
                        })
                    } else {
                        console.log('getSelectedUserDetails return -1');
                        response.status(500).send({message: 'return value = -1'});
                    }
                }
            })
        ;
    } catch (e) {
        response.status(500).send(
            {
                status: false
            }
        )
    }
});

router.post('/delete-selected-product', verifyToken, verifyAdmin, async (request, response) => {

    console.log(request.body.selectedProductID + ' 377 admin.js');
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_productID', sql.Int, request.body.selectedProductID)
            .execute('deleteSelectedProduct', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    // console.log('Product deleted successfully!');
                    if (result.returnValue === 0) {
                        console.log(JSON.stringify(result));
                        // delete comment attachments from local memory
                        if (result.recordsets[0] && result.recordsets[0].length !== 0) {
                            for (let i = 0; i < result.recordsets[0].length; i++) {
                                const path = './pictures/comment-pictures/' + result.recordsets[0][i].textOrImageName;
                                try {
                                    fs.unlinkSync(path);
                                    //file removed
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        }
                        // delete complaint attachments from local memory
                        if (result.recordsets[1] && result.recordsets[1].length !== 0) {
                            for (let i = 0; i < result.recordsets[1].length; i++) {
                                const path = './pictures/complaint-pictures/' + result.recordsets[1][i].imageName;
                                try {
                                    fs.unlinkSync(path);
                                    //file removed
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        }
                        response.status(200).send({
                            status: true,
                            message: 'Product deleted successfully!'
                        });
                    } else {
                        console.log('return -1 ');
                        response.status(500).send({
                            status: false,
                            message: 'return value = -1'
                        });
                    }
                }
            })
        ;
    } catch (e) {
        console.log(e);
        response.status(500).send(
            {
                status: false
            }
        )
    }
});


//-----------------------------------------feedbacks---------------------------------------------
router.post('/get-feedbacks-details', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from FEEDBACK', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-selected-feedback-details', verifyToken, verifyAdmin, async (request, response) => {
    console.log(' complaintID: ' + request.body.complaintID);

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.body.complaintID)
            .execute('getSelectedFeedbackDetails', (error, result) => {
                if (error) {
                    console.log('cannot run getSelectedFeedbackDetails');
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log(JSON.stringify(result) + ' 659 admin.js');
                        response.status(200).send({
                            status: true,
                            data: {
                                complaintID: result.recordsets[0][0].complaintID,
                                description: result.recordsets[0][0].description,
                                satisfaction: result.recordsets[0][0].satisfaction,
                                productID: result.recordsets[1][0].productID,
                                productName: result.recordsets[1][0].productName,
                                projectManagerEmail: result.recordsets[2][0].userEmail,
                                projectManagerFirstName: result.recordsets[2][0].firstName,
                                projectManagerLastName: result.recordsets[2][0].lastName,
                                accountCoordinatorEmail: result.recordsets[3][0].userEmail,
                                accountCoordinatorFirstName: result.recordsets[3][0].firstName,
                                accountCoordinatorLastName: result.recordsets[3][0].lastName,
                                customerEmail: result.recordsets[4][0].userEmail,
                                customerFirstName: result.recordsets[4][0].firstName,
                                customerLastName: result.recordsets[4][0].lastName,
                                submittedDate: result.recordsets[5][0].submittedDate,
                                lastDateOfPending: result.recordsets[5][0].lastDateOfPending,
                                wipStartDate: result.recordsets[5][0].wipStartDate,
                                finishedDate: result.recordsets[5][0].finishedDate,
                                nOfSubComplaints: result.recordsets[6][0].nOfSubComplaints
                            },
                        })
                    } else {
                        console.log('getSelectedUserDetails return -1');
                        response.status(500).send({message: 'return value = -1'});
                    }
                }
            })
        ;
    } catch (e) {
        response.status(500).send(
            {
                status: false
            }
        )
    }
});

router.post('/delete-selected-feedback', verifyToken, verifyAdmin, async (request, response) => {

    console.log(request.body.complaintID);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.body.complaintID)
            .query('DELETE FROM FEEDBACK where complaintID=@_complaintID ', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false,
                        message: 'Something went wrong!'
                    });
                } else {
                    // console.log('Feedback deleted successfully!');

                    console.log(JSON.stringify(result));
                    response.status(200).send({
                        status: true,
                        message: 'Feedback deleted successfully!'
                    });
                }
            })
        ;
    } catch (e) {
        console.log(e);
        response.status(500).send(
            {
                status: false
            }
        )
    }
});

//........................................... dashboard....................

router.post('/get-all-user-count', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('SELECT count(*) as count FROM USERS', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-active-user-count', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select  count(*) as count from USERS where USERS.activeStatus =\'true\'', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-all-complaints-count', verifyToken, verifyAdmin, async (request, response) => {
    const pool = await poolPromise;
    try {
        pool.request()
            .execute('getComplaintCount', (error, result) => {
                if (error) {
                    console.log('cannot run getComplaintCount');
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: {
                            alll: result.recordsets[0][0].alll,
                            clos: result.recordsets[4][0].clos
                        },
                    })
                }
            })
        ;
    } catch (e) {
        response.status(500).send({status: false});
    }
});


// .........................chart..............

//.......................................  COMPLAINT RELEVANT TO TIME
router.get('/get-month-count', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .execute('getMonthComplaintCount', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: {
                            first: result.recordsets[0][0].num,
                            second: result.recordsets[1][0].num,
                            third: result.recordsets[2][0].num,
                            fourth: result.recordsets[3][0].num,
                            fifth: result.recordsets[4][0].num,
                            firstm: result.recordsets[0][0].month,
                            secondm: result.recordsets[1][0].month,
                            thirdm: result.recordsets[2][0].month,
                            fourthm: result.recordsets[3][0].month,
                            fifthm: result.recordsets[4][0].month
                        }
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

// ..............timme ekta anuwa users la...

router.get('/get-month-count-users', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .execute('getMonthUsersCount', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: {
                            first: result.recordsets[0][0].num,
                            second: result.recordsets[1][0].num,
                            third: result.recordsets[2][0].num,
                            fourth: result.recordsets[3][0].num,
                            fifth: result.recordsets[4][0].num,
                            firstm: result.recordsets[0][0].month,
                            secondm: result.recordsets[1][0].month,
                            thirdm: result.recordsets[2][0].month,
                            fourthm: result.recordsets[3][0].month,
                            fifthm: result.recordsets[4][0].month
                        }
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.get('/get-feedback-count', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .execute('getFeedbackCount', (error, result) => {
                if (error) {
                    console.log('cannot run getFeedbackCount');
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: {
                            sat1: result.recordsets[0][0].sat1,
                            sat2: result.recordsets[1][0].sat2,
                            sat3: result.recordsets[2][0].sat3,
                            sat4: result.recordsets[3][0].sat4,
                            sat5: result.recordsets[4][0].sat5
                        },
                    })
                }
            })
        ;
    } catch (e) {
        response.status(500).send(
            {
                status: false
            }
        )
    }
});


router.post('/get-active-users', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from USERS where USERS.activeStatus = \'true\'', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/update-Ac', verifyToken, async (request, response) => {
    const data = request.body;
    console.log(data.v);
    console.log(data.u.userID);

    async function main() {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'info.afisolve@gmail.com', // generated ethereal user
                pass: 'codered09' // generated ethereal password
            },
        });

        let info = await transporter.sendMail({
            from: 'info.afisolve@gmail.com', // sender address
            to: data.w, // list of receivers
            subject: "Remove as Account Coordinator", // Subject line
            text: "Dear Sir/Madam,\n" +
                "    We discussed your problem which is working as account coordinator of the product Id " + data.v + "product. Therefore, you have been removed as account coordinator of this product.\n" +
                "\n" +
                "    NOTE: If you have any issue, please contact the admin of the complaint management unit.\n" +
                "\n" +
                "    Best Regards,\n" +
                "    afi-Solve Complaint Management Unit,\n" +
                "    Afisol (Pvt) Ltd.   \n" +
                " _________________________________________________________________________ \n" +
                "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n"
        });

        let info1 = await transporter.sendMail({
            from: 'info.afisolve@gmail.com', // sender address
            to: data.u.userEmail, // list of receivers
            subject: "New Approval", // Subject line
            text: "Dear Sir/Madam,\n" +
                "    You have been selected as the new Account Coordinator of Product ID " + data.v + ". Please pay attention to provide solutions to complaints of this product.\n" +
                "\n" +
                "    NOTE: If you have any issue, please contact the admin of the complaint management unit.\n" +
                "\n" +
                "    Best Regards,\n" +
                "    afi-Solve Complaint Management Unit,\n" +
                "    Afisol (Pvt) Ltd.   \n" +
                " _________________________________________________________________________ \n" +
                "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n" +
                "\n"
        });
    }

    main().catch(console.error);

    try {
        const pool = await poolPromise;
        pool.request()
            .input('_cbc', sql.Int, data.u.userID)
            .input('_pdi', sql.Int, data.v)
            .execute('updateAccountCoordinator', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });

                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }

});

router.post('/get-project-Manager-List', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select u.userEmail, u.firstName, u.lastName, u.userID\n' +
                'from USERS u,USER_ROLE r\n' +
                'where u.userID = r.userID and r.roleID = \'3\'', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/update-Pm', verifyToken, async (request, response) => {
    const data = request.body;
    console.log(data.v);
    console.log(data.u.userID);

    async function main() {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'info.afisolve@gmail.com', // generated ethereal user
                pass: 'codered09' // generated ethereal password
            },
        });

        let info = await transporter.sendMail({
            from: 'info.afisolve@gmail.com', // sender address
            to: data.w, // list of receivers
            subject: "Remove as Project Manager", // Subject line
            text: "Dear Sir/Madam,\n" +
                "    We discussed your problem which is working as project manager of the product Id " + data.v + " product. Therefore, you have been removed as project manager of this product.\n" +
                "\n" +
                "    NOTE: If you have any issue, please contact the admin of the complaint management unit.\n" +
                "\n" +
                "    Best Regards,\n" +
                "    afi-Solve Complaint Management Unit,\n" +
                "    Afisol (Pvt) Ltd.   \n" +
                " _________________________________________________________________________ \n" +
                "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n"
        });

        let info1 = await transporter.sendMail({
            from: 'info.afisolve@gmail.com', // sender address
            to: data.u.userEmail, // list of receivers
            subject: "New Approval", // Subject line
            text: "Dear Sir/Madam,\n" +
                "    You have been selected as the new project manager of Product ID " + data.v + ". Please pay attention to provide solutions to complaints of this product.\n" +
                "\n" +
                "    NOTE: If you have any issue, please contact the admin of the complaint management unit.\n" +
                "\n" +
                "    Best Regards,\n" +
                "    afi-Solve Complaint Management Unit,\n" +
                "    Afisol (Pvt) Ltd.   \n" +
                " _________________________________________________________________________ \n" +
                "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n" +
                "\n"
        });
    }

    main().catch(console.error);

    try {
        const pool = await poolPromise;
        pool.request()
            .input('_cbc', sql.Int, data.u.userID)
            .input('_pdi', sql.Int, data.v)
            .execute('updateProjectManger', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });

                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }

});

router.post('/get-developer-List', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select u.userID as devID, u.firstName as devFirst, u.lastName as devLast  from USERS u, USER_ROLE ur where u.userID = ur.userID and ur.roleID = \'2\'', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

module.exports = router;
