const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');
const {verifyToken} = require('../helpers/verifyToken');
const {verifyAccountCoordinator} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From authentication route');
});

//-------------------------------Complaints--------------------------------------//
//add-complaint
router.post('/add-complaint', verifyToken, verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    console.log(request.body);
    try {
        pool.request()
            .input('_productID', sql.Int, request.body.productID)
            .input('_description', sql.VarChar(5000), request.body.description)
            .execute('AccCoordinatoraddComplaint', (error, result) => {
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

// update comman complaint status
router.post('/update-common-complaint-status', verifyToken, verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    console.log(request.body);
    try {
        pool.request()
            .input('_ID', sql.Int, request.body.complaintID)
            .input('_subID', sql.Int, request.body.subComplaintID)
            .input('_Status', sql.VarChar(10), request.body.complaintStatus)
            .execute('updateComplaintStatusDetails', (error, result) => {
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

//Complaint profile current
router.post('/get-selected-accoorcomplaint-details-current', verifyToken, verifyAccountCoordinator, async (request, response) => {
    console.log(' complaintID: '+ request.body.complaintID);
    console.log(' subComplaintID: '+ request.body.subComplaintID);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.body.complaintID)
            .input('_subComplaintID', sql.Int, request.body.subComplaintID)
            .execute('getSelectedAccComplaintDetailsCurrent', (error, result) => {
                if (error) {
                    console.log('cannot run getSelectedaccoorcomplaintdetailscurrent');
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log(JSON.stringify(result));
                        response.status(200).send({
                            status: true,
                            data: {
                                complaintID: result.recordsets[0][0].complaintID,
                                subComplaintID: result.recordsets[0][0].subComplaintID,
                                description: result.recordsets[0][0].description,
                                lastDateOfPending: result.recordsets[0][0].lastDateOfPending,
                                wipStartDate: result.recordsets[0][0].wipStartDate,
                                finishedDate: result.recordsets[0][0].finishedDate,
                                productID: result.recordsets[0][0].productID,
                                projectManagerEmail: result.recordsets[1][0].userEmail,
                                projectManagerFirstName: result.recordsets[1][0].firstName,
                                projectManagerLastName: result.recordsets[1][0].lastName,

                            }
                        })
                    } else {
                        console.log('getSelectedaccoorcomplaintdetailscurrent return -1');
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
//All complaints
router.post('/get-accoorcomplaints-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category, c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p where c.status=s.statusID AND c.productID= p.productID order by c.complaintID',
                (error, result) => {
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
            .query("select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category , c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p where c.status=s.statusID AND c.productID= p.productID AND s.statusName = 'Pending' order by c.complaintID", (error, result) => {
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
            .query("select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category, c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p where c.status=s.statusID AND c.productID= p.productID AND s.statusName = 'InProgress' order by c.complaintID", (error, result) => {
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
            .query("select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category, c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p where c.status=s.statusID AND c.productID= p.productID AND s.statusName = 'Completed' order by c.complaintID", (error, result) => {
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
            .query("select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category, c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p where c.status=s.statusID AND c.productID= p.productID AND s.statusName = 'Closed' order by c.complaintID", (error, result) => {
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

//----------------------------------Tasks-----------------------------------------//
//Create New task
router.post('/create-task', verifyToken, verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    console.log(request.body)
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.body.complaintID)
            .input('_subComplaintID', sql.Int, request.body.subComplaintID)
            .input('_deadline', sql.DateTime, request.body.deadline)
            .input('_taskdescription', sql.VarChar(200), request.body.task_description)
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .input('_developerEmail', sql.VarChar(50), request.body.developerEmail)
            .execute('createTask', (error, result) => {
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
router.post('/get-Task-IP-details', verifyToken, verifyAccountCoordinator, async (request, response) => {

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
// Get selected task details
router.post('/get-selected-task-details', verifyToken, verifyAccountCoordinator, async (request, response) => {
    console.log(' taskID: '+ request.body.taskID);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_taskID', sql.Int, request.body.taskID)
            .execute('getSelectedTaskDetails', (error, result) => {
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
                            }
                        })
                    } else {
                        console.log('getSelectedTaskDetails return -1');
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

//----------------------------------------------Allocation-----------------------------------------------//
router.post('/get-allocation-details', verifyToken, verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select a.productID, p.productName,u.firstName+' '+u.lastName as DevName, a.developerEmail, u.contactNumber from ALLOCATION a,USERS u,PRODUCT p where a.developerEmail=u.userEmail AND a.productID = p.productID order by a.productID", (error, result) => {
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

//----------------------------------Product Details-----------------------------------------------//

router.post('/get-product-details', verifyToken, verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query("select p.productID,p.productName,p.category,u.firstName+' '+u.lastName as CusName,c.companyName,c.customerEmail,u.contactNumber from PRODUCT p,CUSTOMER c,USERS u where p.customerEmail=c.customerEmail AND c.customerEmail=u.userEmail", (error, result) => {
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
