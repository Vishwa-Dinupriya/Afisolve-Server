const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');
const {verifyAdmin} = require('../helpers/verifyToken');

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

    console.log(request.payload.username + ' 61 admin.js');
    console.log(request.body.selectedUserEmail + ' 62 admin.js');
    console.log(request.body);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_username', sql.VarChar(50), request.body.selectedUserEmail)
            .execute('getSelectedUserDetails', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log(result.recordsets[0][0].firstName + ' 73 admin.js')
                        console.log(JSON.stringify(result) + ' 74 admin.js');
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
                            roles: result.recordsets[1],
                            defaultRoleID: result.recordsets[2][0].roleID
                        })
                    } else {
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
    console.log(request.body.emailOld + ' admin.js 107');
    console.log(request.body.userNewData.defaultRole + ' admin.js 108');

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
            .input('_password', sql.VarChar(20), data.password)
            .input('_roles', roles)
            .input('_defaultRole', sql.Int, data.defaultRole)
            .input('_contactNumber', sql.VarChar(20), data.contactNumber)
            .execute('updateSelectedUserDetails', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false,
                        message: 'query Error..!'
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
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log(result.recordsets[0][0].firstName + ' 73 admin.js')
                        console.log(JSON.stringify(result) + ' 74 admin.js');
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
                            roles: result.recordsets[1],
                            defaultRoleID: result.recordsets[2][0].roleID
                        })
                    } else {
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


// router.post('/update-complaint-status', verifyToken, async (request, response) => {
//
//     const complainID = request.body.complainID;
//     const pool = await poolPromise;
//     pool.request()
//         .input('complainID', sql.Int, complainID)
//         .query('UPDATE ', (error, result) => {
//
//         });
//
// });

router.post('/get-complaints-details', verifyToken, verifyAdmin, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from COMPLAINT', (error, result) => {
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


router.post('/get-products-details', verifyToken, verifyAdmin, async (request, response) => {

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
