const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');
const {verifyToken} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From authentication route');
});

//All complaints
router.post('/get-accoorcomplaints-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from COMPLAINT ', (error, result) => {
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

//filter new complaints
router.post('/get-new-accoorcomplaints-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select * from COMPLAINT where complaint_status = 'New'", (error, result) => {
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
//////////////////////////////////////////////////Tasks///////////////////////////////////////////////////////////////////////////////////

//Get ip task details
router.post('/get-Task-IP-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select t.taskID,t.complaintID,t.subComplaintID,t.assignDate,t.deadline,t.developerEmail,u.firstName+\' \'+u.lastName as DevName from TASK t,USERS u where t.developerEmail=u.userEmail AND t.completed=0', (error, result) => {
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
///////////////////////////////////////Allocation//////////////////////////////////////////////////////////
router.post('/get-allocation-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select a.productID,u.firstName+' '+u.lastName as DevName,a.developerEmail from ALLOCATION a,USERS u where a.developerEmail=u.userEmail", (error, result) => {
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
