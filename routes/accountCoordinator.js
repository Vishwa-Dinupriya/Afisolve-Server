const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');
const {verifyAccountCoordinator} = require('../helpers/verifyToken');
const nodemailer = require("nodemailer");
const {verifyToken} = require('../helpers/verifyToken');
const fs = require("fs");

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

//update-complaint-status
router.post('/update-complaint-status', verifyToken, verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    console.log(request.body);
    try {
        pool.request()
            .input('_ID', sql.Int, request.body.complaintID)
            .input('_subID', sql.Int, request.body.subComplaintID)
            .input('_Status', sql.VarChar(10), request.body.complaintStatus)
            .execute('updateComplaintStatusDetailsByAccoor', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    response.status(200).send({
                        status: true
                    });
                }
            })
    }
    catch (e) {
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
                        let images = [ ];
                        const nImages = result.recordsets[2].length;
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
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query('select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category, c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p, Ayoma_AccountCoordinators aa where c.status=s.statusID AND c.productID= p.productID AND aa.userID=p.accountCoordinatorID AND aa.userEmail = @_accountCoordinatorEmail order by c.complaintID',
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
// Get Overdue complaint details
router.post('/get-overdue-accoorcomplaints-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category , c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p, Ayoma_AccountCoordinators aa where c.status=s.statusID AND c.productID= p.productID AND aa.userID=p.accountCoordinatorID AND aa.userEmail = @_accountCoordinatorEmail AND c.lastDateOfPending < GETDATE() and s.statusName = 'Pending' order by c.complaintID", (error, result) => {
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
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category , c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p, Ayoma_AccountCoordinators aa where c.status=s.statusID AND c.productID= p.productID AND aa.userID=p.accountCoordinatorID AND aa.userEmail = @_accountCoordinatorEmail AND s.statusName = 'Pending' AND acViewedStatus = 0 order by c.complaintID", (error, result) => {
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
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category, c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p, Ayoma_AccountCoordinators aa where c.status=s.statusID AND c.productID= p.productID AND aa.userID=p.accountCoordinatorID AND aa.userEmail = @_accountCoordinatorEmail AND s.statusName = 'InProgress' order by c.complaintID", (error, result) => {
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
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category, c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p, Ayoma_AccountCoordinators aa where c.status=s.statusID AND c.productID= p.productID AND aa.userID=p.accountCoordinatorID AND aa.userEmail = @_accountCoordinatorEmail AND s.statusName = 'Completed'order by c.complaintID", (error, result) => {
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
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select c.complaintID,c.subComplaintID,c.finishedDate,c.lastDateOfPending,c.submittedDate,c.wipStartDate,s.statusName,p.productName, p.category, c.productID from COMPLAINT c,COMPLAINT_STATUS s, PRODUCT p, Ayoma_AccountCoordinators aa where c.status=s.statusID AND c.productID= p.productID AND aa.userID=p.accountCoordinatorID AND aa.userEmail = @_accountCoordinatorEmail AND s.statusName = 'Closed' order by c.complaintID", (error, result) => {
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
            .input('_taskdescription', sql.VarChar(5000), request.body.task_description)
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .input('_developerEmail', sql.VarChar(50), request.body.developerEmail)
           // .input('_developerName', sql.VarChar(50), request.body.selectedName)
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
router.post('/update-developer', verifyToken, verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    console.log(request.body)
    try {
        pool.request()
            .input('_taskID', sql.Int, request.body.taskID)
            .input('_developerEmail', sql.VarChar(50), request.body.developerEmail)
            .input('_deadline', sql.DateTime, request.body.deadline)
            .execute('updateDeveloperByAccoor', (error, result) => {
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

//------------------------------Developer Email list----------------------------------//

router.post('/get-DeveloperList', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
           // .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select userEmail as developerEmail, firstName + ' ' + lastName as developerName from Ayoma_Developers", (error, result) => {
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

//---------------------------Complaint Id list--------------------------------------------------------//
router.post('/get-complaintIDlist', verifyToken,verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            // .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select distinct complaintID from COMPLAINT", (error, result) => {
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
//---------------------------Complaint Id list--------------------------------------------------------//
router.post('/get-subComplaintIDlist', verifyToken,verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            // .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select distinct subComplaintID from COMPLAINT", (error, result) => {
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

//------------------------------User list----------------------------------//

router.post('/get-UserList', verifyToken,verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            // .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select userEmail, firstName + ' ' + lastName as userName from USERS", (error, result) => {
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
//------------------------------Customer list----------------------------------//

router.post('/get-CustomerList', verifyToken,verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            // .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select userEmail as customerEmail, firstName + ' ' + lastName as customerName from Ayoma_Customers", (error, result) => {
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

//-----------------------------------------------------------------------------------//

//Get All task details
router.post('/get-Task-All-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select t.taskID,t.complaintID,t.subComplaintID,t.assignDate,t.deadline,t.task_status,ad.userEmail as developerEmail,ad.firstName+\' \'+ad.lastName as DevName from TASK t,Ayoma_AccountCoordinators aa, Ayoma_Developers ad where t.developerID=ad.userID AND t.accountCoordinatorID = aa.userID AND aa.userEmail = @_accountCoordinatorEmail order by t.complaintID", (error, result) => {
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
//Get Overdue task details
router.post('/get-Task-Overdue-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select t.taskID,t.complaintID,t.subComplaintID,t.assignDate,t.deadline,ad.userEmail as developerEmail,ad.firstName+\' \'+ad.lastName as DevName from TASK t,Ayoma_AccountCoordinators aa, Ayoma_Developers ad where t.developerID=ad.userID AND t.accountCoordinatorID = aa.userID AND aa.userEmail = @_accountCoordinatorEmail AND t.task_status='Pending' AND t.deadline < GETDATE()", (error, result) => {
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
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select t.taskID,t.complaintID,t.subComplaintID,t.assignDate,t.deadline,ad.userEmail as developerEmail,ad.firstName+\' \'+ad.lastName as DevName from TASK t,Ayoma_AccountCoordinators aa, Ayoma_Developers ad where t.developerID=ad.userID AND t.accountCoordinatorID = aa.userID AND aa.userEmail = @_accountCoordinatorEmail AND t.task_status='Pending'", (error, result) => {
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
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select t.taskID,t.complaintID,t.subComplaintID,t.assignDate,t.deadline,ad.userEmail as developerEmail,ad.firstName+\' \'+ad.lastName as DevName from TASK t,Ayoma_AccountCoordinators aa, Ayoma_Developers ad where t.developerID=ad.userID AND t.accountCoordinatorID = aa.userID AND aa.userEmail = @_accountCoordinatorEmail AND t.task_status='InProgress'", (error, result) => {
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
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select t.taskID,t.complaintID,t.subComplaintID,ad.userEmail as developerEmail,ad.firstName+\' \'+ad.lastName as DevName from TASK t,Ayoma_AccountCoordinators aa, Ayoma_Developers ad where t.developerID=ad.userID AND t.accountCoordinatorID = aa.userID AND aa.userEmail = @_accountCoordinatorEmail AND t.task_status='Completed'", (error, result) => {
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
            .query("select a.productID, p.productName,u.firstName+' '+u.lastName as DevName, u.userEmail as developerEmail, u.contactNumber from ALLOCATION a,Ayoma_Developers u,PRODUCT p where a.developerID=u.userID AND a.productID = p.productID order by a.productID", (error, result) => {
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
            .query("select p.productID,p.productName,p.category,u.firstName+' '+u.lastName as CusName,u.userEmail,u.contactNumber from PRODUCT p,USERS u where p.customerID=u.userID", (error, result) => {
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
//----------------------------------Product Details-----------------------------------------------//

router.post('/get-myproduct-details', verifyToken, verifyAccountCoordinator, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_accountCoordinatorEmail', sql.VarChar(50), request.payload.username)
            .query("select p.productID,p.productName,p.category,u.firstName+' '+u.lastName as CusName,u.userEmail,u.contactNumber from PRODUCT p,USERS u where p.customerID=u.userID and p.accountCoordinatorID = (select userID from USERS where userEmail= @_accountCoordinatorEmail)", (error, result) => {
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


//-----------------------Send Mail-----------------------------//
router.post('/sendMail', verifyToken, async (request, response) => {
    const data = request.body;
    console.log(data)
    const receiver= data.userEmail;
    const subject = data.subject;
    const message = data.message;
    const senderEmail = request.payload.username;
    console.log(receiver);

    // Nodemailer
    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
       // let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'info.afisolve@gmail.com', // generated ethereal user
                pass: 'codered09', // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from:'info.afisolve@gmail.com', // sender address
            to: receiver, // list of receivers
            subject: subject, // Subject line
            text: message, // plain text body
        });

       // console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
       // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);
    response.status(200).send({
        status: true,

    });

});

//-----------------------Send Mail to Customer-----------------------------//
router.post('/sendMailtoCustomer', verifyToken, async (request, response) => {
    const data = request.body;
    console.log(data)
    const receiver= data.customerEmail;
    const compID= data.complaintID;
    const subject = data.cusSubject;
    let Messeage;
    const senderEmail = request.payload.username;
    console.log(receiver);
if(subject=='Complaint is in progress'){
    Messeage = 'Dear Sir/Madam, \n'+
               'This is in reference to the Complaint' + compID + 'that you have lodged. We got your complaint under supervision and currently the solving process is in progress.\n' +
               'Thank you!'+
        "\n" +
    "    Best Regards,\n" +
    "    afi-Solve Complaint Management Unit,\n" +
    "    Afisol (Pvt) Ltd.   \n" +
    " _________________________________________________________________________ \n" +
    "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n"
} else if(subject=='Complaint Resolved'){
    Messeage = 'Dear Sir/Madam, \n'+
        'This is in reference to the Complaint' + compID + 'that you have lodged. We happy to inform that the resolving process is completed. We are looking forward for your feedback.\n' +
        'Thank you!'+
        "\n" +
        "    Best Regards,\n" +
        "    afi-Solve Complaint Management Unit,\n" +
        "    Afisol (Pvt) Ltd.   \n" +
        " _________________________________________________________________________ \n" +
        "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n"
} else if(subject=='Complaint Closed'){
    Messeage = 'Dear Sir/Madam, \n'+
        'This is in reference to the Complaint' + compID + 'that you have lodged. We have closed your complaint as there were no further issues from your side.\n' +
        'Thank you!'+
        "\n" +
        "    Best Regards,\n" +
        "    afi-Solve Complaint Management Unit,\n" +
        "    Afisol (Pvt) Ltd.   \n" +
        " _________________________________________________________________________ \n" +
        "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n"
} else {
    Messeage = 'Dear Sir/Madam, \n'+
        'This is in reference to the Complaint' + compID + 'that you have lodged. We need some clarifications regarding to your complaint. Please check the comment section in afisolve app.\n' +
        'Thank you!'+
        "\n" +
        "    Best Regards,\n" +
        "    afi-Solve Complaint Management Unit,\n" +
        "    Afisol (Pvt) Ltd.   \n" +
        " _________________________________________________________________________ \n" +
        "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n"
}
    // Nodemailer

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
                user: 'info.afisolve@gmail.com', // generated ethereal user
                pass: 'codered09', // generated ethereal password
            },
        });
    // send mail with defined transport object
        let info = await transporter.sendMail({
            from:'info.afisolve@gmail.com', // sender address
            to: receiver, // list of receivers
            subject: subject, // Subject line
            text: Messeage,
        });
}
main().catch(console.error);
    response.status(200).send({
        status: true,

    });

});

//-----------------------Send Mail to Developer-----------------------------//
router.post('/sendMailtoDeveloper', verifyToken, async (request, response) => {
    const data = request.body;
    console.log(data)
    const receiver= data.developerEmail;
    const taskID= data.taskID;
    const subject = data.devSubject;
    let Messeage;
    const senderEmail = request.payload.username;
    console.log(receiver);
    if(subject=='Overdue Task'){
        Messeage = 'Dear Sir/Madam, \n'+
            'This is in reference to the Task' + taskID +'. Please pay your attention to complete the task ASAP.\n' +
            'Thank you!'+
            "\n" +
            "    Best Regards,\n" +
            "    afi-Solve Complaint Management Unit,\n" +
            "    Afisol (Pvt) Ltd.   \n" +
            " _________________________________________________________________________ \n" +
            "    Disclaimer: This is a system-generated mail. For any queries, please contact the relevant Account Coordinator.\n"
    } else if(subject=='New Task'){
        Messeage = 'Dear Sir/Madam, \n'+
            'You are assigned to the Task' + taskID + '. Please go through the task and complete before the deadline.\n' +
            'Thank you!'+
            "\n" +
            "    Best Regards,\n" +
            "    afi-Solve Complaint Management Unit,\n" +
            "    Afisol (Pvt) Ltd.   \n" +
            " _________________________________________________________________________ \n" +
            "    Disclaimer: This is a system-generated mail. For any queries, please contact the relevant Account Coordinator.\n"
    } else if(subject=='Urgent Task'){
        Messeage = 'Dear Sir/Madam, \n'+
            'This is in reference to the Task' + taskID + '. Please pay your attention to speedup your work.\n' +
            'Thank you!'+
            "\n" +
            "    Best Regards,\n" +
            "    afi-Solve Complaint Management Unit,\n" +
            "    Afisol (Pvt) Ltd.   \n" +
            " _________________________________________________________________________ \n" +
            "    Disclaimer: This is a system-generated mail. For any queries, please contact the relevant Account Coordinator.\n"
    } else {
        Messeage = 'Dear Sir/Madam, \n'+
            'This is in reference to the Task' + taskID + '. Please go through the task againg as there is some issues related to the solution.\n' +
            'Thank you!'+
            "\n" +
            "    Best Regards,\n" +
            "    afi-Solve Complaint Management Unit,\n" +
            "    Afisol (Pvt) Ltd.   \n" +
            " _________________________________________________________________________ \n" +
            "    Disclaimer: This is a system-generated mail. For any queries, please contact the relevant Account Coordinator.\n"
    }
    // Nodemailer

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'info.afisolve@gmail.com', // generated ethereal user
                pass: 'codered09', // generated ethereal password
            },
        });
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from:'info.afisolve@gmail.com', // sender address
            to: receiver, // list of receivers
            subject: subject, // Subject line
            text: Messeage,
        });
    }
    main().catch(console.error);
    response.status(200).send({
        status: true,

    });

});


//-------------------------------------------------customer-comments---------------------------------------------------------------------------------------------------------

//--get comments for requested complaint ID
// i removed verufyCustomer middleware function from this route  because of refreshNeeded subject problem. (i should have to learn websocket)
router.get('/get-comments', verifyToken, async (request, response) => {
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.query.complaintID)
            .input('_reqSenderUname', sql.VarChar(50), request.payload.username)
            .query('SELECT * FROM COMMENT C WHERE complaintID=@_complaintID ORDER BY C.submittedTime \n'+
                ' select userID from USERS U WHERE userEmail=@_reqSenderUname', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    // console.log(JSON.stringify(result) + ' : 268 customer');
                    let comments = [];
                    let textOrImage;
                    let avatarPicture;
                    const nComments = result.recordsets[0].length;
                    for (let i = 0; i < nComments; i++) {
                        if (result.recordsets[0][i].isImage == true) {
                            try {//get the picture to 'img' from local memory
                                textOrImage = fs.readFileSync('./pictures/comment-pictures/' + result.recordsets[0][i].textOrImageName, {encoding: 'base64'})
                            } catch (error) {
                                textOrImage = fs.readFileSync('./pictures/comment-pictures/default-comment-picture.png', {encoding: 'base64'});
                            }
                        } else { // when comment is not an image
                            textOrImage = result.recordsets[0][i].textOrImageName
                        }
                        if (result.recordsets[0][i].senderID !== request.payload.userID) {
                            // console.log(result.recordsets[0][i]);
                            try {//get the picture to 'img' from local memory
                                avatarPicture = fs.readFileSync('./pictures/profile-pictures/' + result.recordsets[0][i].senderID + '.png', {encoding: 'base64'})
                            } catch (error) {
                                avatarPicture = fs.readFileSync('./pictures/profile-pictures/default-profile-picture.png', {encoding: 'base64'});
                            }
                        } else {
                            avatarPicture = null;
                        }
                        comments[i] = {
                            IsImage: result.recordsets[0][i].isImage,
                            content: textOrImage,
                            senderID: result.recordsets[0][i].senderID,
                            senderAvatarPicture: avatarPicture
                        }
                    }
                    response.status(200).send({
                        status: true,
                        data: comments
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
})

//--save comments for requested complaint ID
router.put('/save-comment_', verifyToken, verifyAccountCoordinator, async (request, response) => {
    console.log(request.payload.username);
    console.log('nOfImages: ' + request.body.images.length);
    console.log('text' + request.body.text);
    const images = request.body.images;
    try {
        const pool = await poolPromise;
        pool.request()
            .input('_senderEmail', sql.VarChar(50), request.payload.username)
            .input('_complaintID', sql.Int, request.body.complaintID)
            .input('_text', sql.VarChar(), request.body.text)
            .input('_noOfImages', sql.Int, request.body.images.length)
            .execute('saveComment', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });

                } else {
                    // console.log(JSON.stringify(result) + ' : 330 customer');
                    if (result.recordsets.length !== 0) {
                        for (let i = 0; i < result.recordsets.length; i++) {
                            //encoding and save the picture to the local memory
                            const path = './pictures/comment-pictures/' + result.recordsets[i][0].textOrImageName;
                            const base64Data = images[i].replace(/^data:([A-Za-z-+/]+);base64,/, '');
                            fs.writeFileSync(path, base64Data, {encoding: 'base64'});
                        }
                    }
                    response.status(200).send({
                        status: true,
                        data: result.recordset
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }

})

//////////////////////////////////////////////////////////////////////////////////////
    /*
    router.post('/get-edit-task-details', verifyToken,verifyAccountCoordinator, async (request, response) => {

        const pool = await poolPromise;
        console.log(' taskID: '+ request.body.taskID);
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
                                    developerEmail: result.recordsets[1][1].userEmail,
                                    deadline: result.recordsets[0][0].deadline,
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

    */

//////////////////////////////////////////////////////////////////////////////////////
module.exports = router;
