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


//filter pending complaints
router.post('/get-pending-accoorcomplaints-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select * from COMPLAINT c,COMPLAINT_STATUS s where c.status=s.statusID AND s.statusName = 'Pending' order by c.complaintID", (error, result) => {
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
//filter InProgress complaints
router.post('/get-InProgress-accoorcomplaints-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select * from COMPLAINT c,COMPLAINT_STATUS s where c.status=s.statusID AND s.statusName = 'InProgress' order by c.complaintID", (error, result) => {
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
//filter InProgress complaints
router.post('/get-Solved-accoorcomplaints-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select * from COMPLAINT c,COMPLAINT_STATUS s where c.status=s.statusID AND s.statusName = 'Completed' order by c.complaintID", (error, result) => {
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
//filter Closed complaints
router.post('/get-Closed-accoorcomplaints-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select * from COMPLAINT c,COMPLAINT_STATUS s where c.status=s.statusID AND s.statusName = 'Closed' order by c.complaintID", (error, result) => {
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
//Get All task details
router.post('/get-Task-All-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select t.taskID,t.complaintID,t.subComplaintID,t.assignDate,t.deadline,t.developerEmail,u.firstName+\' \'+u.lastName as DevName from TASK t,USERS u where t.developerEmail=u.userEmail", (error, result) => {
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


//Get new task details
router.post('/get-Task-New-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select t.taskID,t.complaintID,t.subComplaintID,t.assignDate,t.deadline,t.developerEmail,u.firstName+\' \'+u.lastName as DevName from TASK t,USERS u where t.developerEmail=u.userEmail AND t.task_status='Pending'", (error, result) => {
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

//Get ip task details
router.post('/get-Task-IP-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select t.taskID,t.complaintID,t.subComplaintID,t.assignDate,t.deadline,t.developerEmail,u.firstName+\' \'+u.lastName as DevName from TASK t,USERS u where t.developerEmail=u.userEmail AND t.task_status='InProgress'", (error, result) => {
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
//Get Completed task details
router.post('/get-Task-Comple-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select t.taskID,t.complaintID,t.subComplaintID,t.developerEmail,u.firstName+\' \'+u.lastName as DevName from TASK t,USERS u where t.developerEmail=u.userEmail AND t.task_status='Completed'", (error, result) => {
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
