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

router.post('/get-users-details-brief', verifyToken, async (request, response) => {

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

router.post('/get-complaints-details', verifyToken, async (request, response) => {

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

router.post('/get-complaints-details-brief', verifyToken, async (request, response) => {

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


router.post('/get-products-details', verifyToken, async (request, response) => {

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

router.post('/get-feedbacks-details', verifyToken, async (request, response) => {

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
