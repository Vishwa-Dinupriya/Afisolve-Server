const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');
const {verifyToken} = require('../helpers/verifyToken');
const {verifyDeveloper} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From authentication route');
});
//--------------------------------------------------------------------------------------------------------------------------------//

//Get All task details
router.post('/get-Task-All-details', verifyToken, verifyDeveloper, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
           .input('_developerEmail', sql.VarChar(50), request.payload.username)
            .query("select t.taskID, p.productName, c.complaintID, c.subComplaintID, t.assignDate, t.deadline,t.task_status from TASK t,PRODUCT p,COMPLAINT c where t.complaintID=c.complaintID AND t.subComplaintID=c.subComplaintID AND c.productID=p.productID AND t.developerEmail=@_developerEmail", (error, result) => {
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
//Get pending task details
router.post('/get-Task-Pending-details', verifyToken,verifyDeveloper, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_developerEmail', sql.VarChar(50), request.payload.username)
            .query("select t.taskID, p.productName, c.complaintID, c.subComplaintID, t.assignDate, t.deadline,t.task_status from TASK t,PRODUCT p,COMPLAINT c where t.complaintID=c.complaintID AND t.subComplaintID=c.subComplaintID AND c.productID=p.productID AND t.developerEmail=@_developerEmail AND t.task_status = 'Pending'", (error, result) => {
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

//Get InProgress task details
router.post('/get-Task-InProgress-details', verifyToken,verifyDeveloper, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_developerEmail', sql.VarChar(50), request.payload.username)
            .query("select t.taskID, p.productName, c.complaintID, c.subComplaintID, t.assignDate, t.deadline,t.task_status from TASK t,PRODUCT p,COMPLAINT c where t.complaintID=c.complaintID AND t.subComplaintID=c.subComplaintID AND c.productID=p.productID AND t.developerEmail=@_developerEmail AND t.task_status = 'InProgress'", (error, result) => {
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
router.post('/get-Task-Completed-details', verifyToken,verifyDeveloper, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_developerEmail', sql.VarChar(50), request.payload.username)
            .query("select t.taskID, p.productName, c.complaintID, c.subComplaintID, t.assignDate, t.deadline,t.task_status from TASK t,PRODUCT p,COMPLAINT c where t.complaintID=c.complaintID AND t.subComplaintID=c.subComplaintID AND c.productID=p.productID AND t.developerEmail=@_developerEmail AND t.task_status = 'Completed'", (error, result) => {
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

// Update developer task status
router.post('/update-devtask-status', verifyToken,verifyDeveloper, async (request, response) => {

    const pool = await poolPromise;
    console.log(request.body);
    try {
        pool.request()
            .input('_taskID', sql.Int, request.body.taskID)
            .input('_task_status', sql.VarChar(20), request.body.task_status)
            .execute('updateDevTaskStatus', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

// Get selected tasl details
router.post('/get-selected-task-details', verifyToken, verifyDeveloper, async (request, response) => {
    console.log(' taskID: '+ request.body.taskID);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_taskID', sql.Int, request.body.taskID)
            .execute('getSelectedDevTaskDetails', (error, result) => {
                if (error) {
                    console.log('cannot run getSelectedTaskDetails');
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log(JSON.stringify(result));
                        response.status(200).send({
                            status: true,
                            data: {
                                taskID: result.recordsets[0][0].taskID,
                                contactNumber: result.recordsets[1][0].contactNumber,
                                task_description: result.recordsets[0][0].task_description,
                                accoorName: result.recordsets[1][0].accoorName,
                                accountCoordinatorEmail: result.recordsets[0][0].accountCoordinatorEmail,
                            }
                        })
                    } else {
                        console.log('getSelectedDevTaskDetails return -1');
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

//--------------------------------------------------------------------------------------------------------------------------------//

//Get Complaint Details
router.post('/get-devComplaints-details', verifyToken,verifyDeveloper, async (request, response) => {

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

//Get Product Details
router.post('/get-devProducts-details', verifyToken,verifyDeveloper, async (request, response) => {

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

module.exports = router;
