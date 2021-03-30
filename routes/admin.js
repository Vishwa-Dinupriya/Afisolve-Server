const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');
const {verifyAdmin} = require('../helpers/verifyToken');

//------------------------------------------users-----------------------------------------------
router.get('/', (req, res, next) => {
    res.send('From admin route');
})

router.post('/get-users-details', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from USERS', (error, result) => {
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

router.post('/get-users-details-brief', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select TOP 5 * from USERS', (error, result) => {
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
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log(result.recordsets[0][0].firstName + ' 74 admin.js')
                        console.log(JSON.stringify(result) + ' 75 admin.js');
                        // console.log(result.recordsets[0][0].firstName);
                        // console.log(JSON.stringify(result.recordsets[1]));
                        response.status(200).send({
                            status: true,
                            firstname: result.recordsets[0][0].firstName,
                            lastname: result.recordsets[0][0].lastName,
                            userEmail: result.recordsets[0][0].userEmail,
                            password: result.recordsets[0][0].password,
                            contactNumber: result.recordsets[0][0].contactNumber,
                            activeStatus: result.recordsets[0][0].ativeStatus,
                            generalData:result.recordsets[0],
                            roles: result.recordsets[1],
                            defaultRoleID: result.recordsets[2][0].roleID
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
    console.log(request.body.emailOld + ' admin.js 113');
    console.log(request.body.userNewData.passwordGroup.password + ' password admin.js 114');

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
            .execute('updateSelectedUserDetails', (error, result) => {
                if (error) {
                    console.log('1');
                    console.log(error);
                    response.status(500).send({
                        status: false,
                        message: error
                    });
                } else {
                    console.log(result);
                    if (result.returnValue === 0) {
                        console.log('Data Successfully Updated!');
                        response.status(200).send({
                            status: true,
                            message: 'Data Successfully Updated!'
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
                        response.status(200).send({});
                    } else {
                        console.log('return -1 ');
                        response.status(500).send({message: 'return value = -1'});
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

router.post('/get-all-complaints', verifyToken, verifyAdmin, async (request, response) => {

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
                    console.log(JSON.stringify(result) + ' 248 admin.js');
                    let complaintElements = [];
                    for (let i = 0; i < result.recordsets[1].length; i++) {
                        complaintElements[i] = {
                            complaintID: result.recordsets[1][i].complaintID,
                            description: result.recordsets[1][i].description,
                            finishedDate: result.recordsets[1][i].finishedDate,
                            lastDateOfPending: result.recordsets[1][i].lastDateOfPending,
                            productID: result.recordsets[1][i].productID[0],
                            status: result.recordsets[1][i].status,
                            subComplaintID: result.recordsets[1][i].subComplaintID,
                            submittedDate: result.recordsets[1][i].submittedDate,
                            wipStartDate: result.recordsets[1][i].wipStartDate,
                            subComplaints: result.recordsets[0].filter(function (element) {
                                return element.complaintID === result.recordsets[1][i].complaintID;
                            })
                        }
                    }
                    console.log(complaintElements);

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

router.post('/get-subComplaints', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complainId', sql.VarChar(10), request.body.selectedComplaintID)
            .execute('getSubComplaintsOfSelectedComplain', (error, result) => {
                    if (error) {
                        console.log('cannot run getSubComplaintsOfSelectedComplain');
                        response.status(500).send({
                            status: false
                        });
                    } else {
                        if (result.returnValue === 0) {
                            console.log(JSON.stringify(result) + ' 74 admin.js');
                            response.status(200).send({
                                status: true,
                                data: result.recordset
                            })
                        } else if (result.returnValue === 1) {
                            console.log(JSON.stringify(result));
                            response.status(500).send({
                                status: false,
                                message: 'no sub-complaints',
                            })
                        } else {
                            console.log('getSubComplaintsOfSelectedComplain return -1');
                            response.status(500).send({message: 'return value = -1'});
                        }
                    }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-selected-complaint-details', verifyToken, verifyAdmin, async (request, response) => {
console.log(' complaintID: '+ request.body.complaintID);
    console.log(' subComplaintID: '+ request.body.subComplaintID);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.body.complaintID)
            .input('_subComplaintID', sql.Int, request.body.subComplaintID)
            .execute('getSelectedComplaintDetails', (error, result) => {
                if (error) {
                    console.log('cannot run getSelectedUserDetails');
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log(JSON.stringify(result) + ' 322 admin.js');
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
                                accountCoordinatorLastName: result.recordsets[4][0].lastName
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
        console.log('wtf?');
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
        const pool = await poolPromise;
        pool.request()
            .input('_productName', sql.VarChar(40), data.productName)
            .input('_category', sql.VarChar(20), data.productCategory)
            .input('_customerEmail', sql.VarChar(50), data.customerEmail)
            .input('_projectManagerEmail', sql.VarChar(50), data.projectManagerEmail)
            .input('_accountCoordinatorEmail', sql.VarChar(50), data.accountCoordinatorEmail)
            .input('_createdAdmin', sql.VarChar(50), requestedAdminEmail)
            .execute('registerProduct',(error, result)=>{
                if (error) {
                    console.log(error);
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
        console.log(e);
        response.status(500).send({status: false});
    }
});

router.post('/get-all-products', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from PRODUCT', (error, result) => {
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
                    if (result.returnValue === 0) {
                        response.status(200).send({});
                    } else {
                        console.log('return -1 ');
                        response.status(500).send({message: 'return value = -1'});
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

module.exports = router;
