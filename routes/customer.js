const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');
const {verifyCustomer} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From authentication route');
});


router.post('/lodge-complaint', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_customerEmail', sql.VarChar(50), request.payload.username)
            .input('_productID', sql.Int, request.body.productID)
            .input('_description', sql.VarChar(5000), request.body.productID)
            .execute('lodgeComplaint', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    console.log(JSON.stringify(result) + ' 75 admin.js');
                    response.status(200).send({
                        status: true
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-all-complaints', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_customerEmail', sql.VarChar(50), request.payload.username)
            .execute('getCustomerAllComplaints', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    console.log(JSON.stringify(result) + ' 75 admin.js');
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


//-------------------------------------------------------------------------------------------------------------------------------------------

router.post('/get-all-products', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_customerEmail', sql.VarChar(50), request.payload.username)
            .query('select * from PRODUCT where customerEmail=@_customerEmail ', (error, result) => {
                if (error) {
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
        response.status(500).send({status: false});
    }
});


module.exports = router;
