const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');
const {verifyToken} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From authentication route');
});

/////////////////////Get Complaint Details/////////////////////////////////////////////////////
router.post('/get-devComplaints-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from COMPLAINT c,COMPLAINT_STATUS s where c.status=s.statusID order by c.complaintID', (error, result) => {
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
///////////////////////////////////////////////////////////////////////////

/////////////////////Get Complaint Details/////////////////////////////////////////////////////
router.post('/get-devProducts-details', verifyToken, async (request, response) => {

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
///////////////////////////////////////////////////////////////////////////


module.exports = router;
