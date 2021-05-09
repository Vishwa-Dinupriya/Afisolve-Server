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
            .query("select t.taskID, p.productName, c.complaintID, c.subComplaintID, t.assignDate, t.deadline,t.task_status from TASK t,PRODUCT p,COMPLAINT c, USERS u where t.complaintID=c.complaintID AND t.subComplaintID=c.subComplaintID AND c.productID=p.productID AND t.developerID = u.userID AND u.userEmail=@_developerEmail", (error, result) => {
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
            .query("select t.taskID, p.productName, c.complaintID, c.subComplaintID, t.assignDate, t.deadline,t.task_status from TASK t,PRODUCT p,COMPLAINT c, USERS u where t.complaintID=c.complaintID AND t.subComplaintID=c.subComplaintID AND c.productID=p.productID AND t.developerID = u.userID AND u.userEmail=@_developerEmail AND t.task_status = 'Pending'", (error, result) => {
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
            .query("select t.taskID, p.productName, c.complaintID, c.subComplaintID, t.assignDate, t.deadline,t.task_status from TASK t,PRODUCT p,COMPLAINT c, USERS u where t.complaintID=c.complaintID AND t.subComplaintID=c.subComplaintID AND c.productID=p.productID AND t.developerID = u.userID AND u.userEmail=@_developerEmail AND t.task_status = 'InProgress'", (error, result) => {
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
            .query("select t.taskID, p.productName, c.complaintID, c.subComplaintID, t.assignDate, t.deadline,t.task_status from TASK t,PRODUCT p,COMPLAINT c, USERS u where t.complaintID=c.complaintID AND t.subComplaintID=c.subComplaintID AND c.productID=p.productID AND t.developerID = u.userID AND u.userEmail=@_developerEmail AND t.task_status = 'Completed'", (error, result) => {
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
                                accountCoordinatorEmail: result.recordsets[1][0].accountCoordinatorEmail,
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
            .query('select c.complaintID, c.subComplaintID, c.productID, p.productName, c.submittedDate,  s.statusName from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p where c.status=s.statusID AND p.productID = c.productID order by c.complaintID', (error, result) => {
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
            .query("select p.productID, p.productName, p.category, ap.firstName +' '+ ap.lastName as projectManagerName , ap.userEmail as projectManagerEmail, aa.firstName +' '+ aa.lastName as accountCoordinatorName, aa.userEmail as accountCoordinatorEmail from PRODUCT p, Ayoma_ProjectManagers ap, Ayoma_AccountCoordinators aa where p.projectManagerID = ap.userID AND p.accountCoordinatorID = aa.userID ", (error, result) => {
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
// Get selected complaint details
router.post('/get-selected-complaint-details', verifyToken,verifyDeveloper,  async (request, response) => {
    console.log(' complaintID: ' + request.body.complaintID);
    console.log(' subComplaintID: ' + request.body.subComplaintID);

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
                        console.log(JSON.stringify(result) + ' 322 developer.js');
                        let images = [ ];
                        const nImages = result.recordsets[5].length;
                        for(let i=0; i<nImages; i++){
                            let img;
                            try {//get the picture to 'img' from local memory
                                img = fs.readFileSync('./pictures/complaint-pictures/' + result.recordsets[5][i].imageName, {encoding: 'base64'})
                            } catch (error) {
                                img = fs.readFileSync('./pictures/profile-pictures/default-profile-picture.png', {encoding: 'base64'});
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
                                accountCoordinatorLastName: result.recordsets[4][0].lastName
                            },
                            images: images
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



module.exports = router;
