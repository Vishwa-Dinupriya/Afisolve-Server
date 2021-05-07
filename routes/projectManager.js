const express = require('express')
const jwt = require('jsonwebtoken')
const {verifyProjectManager} = require("../helpers/verifyToken");
const router = express.Router();
const nodemailer = require('nodemailer');

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From authentication route');
});



//------------------------------------------view reports-------------------------------------------

router.get('/get-complaint-details1', verifyToken,verifyProjectManager, async (request, response) => {
    console.log('fg dvdc dascdw qdwdw qqdwdwd');
    console.log(request.payload.username);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName, u.lastName, p.productID from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail)', (error, result) => {
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





//---------------------------late complaint----------------------------------------------------
router.get('/get-complaint-details', verifyToken, verifyProjectManager,  async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select c.complaintID, p.productID\n' +
                '                       ,c.description\n' +
                '                       ,c.submittedDate\n' +
                '                      , c.lastDateOfPending\n' +
                '                      ,u.firstName\n' +
                '                      ,u.lastName\n' +
                '                     , u.userEmail\n' +
                '                      , p.accountCoordinatorID\n' +
                '                from COMPLAINT c\n' +
                '                     ,PRODUCT p\n' +
                '                     ,COMPLAINT_STATUS s\n' +
                '                     ,USERS u\n' +
                '                where c.productID = p.productID\n' +
                '                  and c.status = s.statusID\n' +
                '                  and u.userID = p.accountCoordinatorID\n' +
                '                  and c.status = \'0\'\n' +
                '                  and c.lastDateOfPending < GETDATE() and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail)', (error, result) => {
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



//----------------------------------------------------------------------------------
///working progress complaints
router.get('/get-complaint-det', verifyToken,verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and c.status = \'1\' and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail)', (error, result) => {
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

///finish complaint
router.get('/get-complaint-de', verifyToken, verifyProjectManager,  async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and c.status = \'2\' and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail)', (error, result) => {
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

///pending complaint
router.get('/get-complaint-detai', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and c.status = \'0\' and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail)', (error, result) => {
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



///-----------------------------Account coordinators lage names ganima........

router.get('/get-account-coordinaters-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from view_ac ', (error, result) => {
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

//-------------------------------------------------------------------------------------------



//------------------------------------------------ aluth namak enter kirima................
router.post('/update-name', verifyToken, async (request, response)=> {
    const data = request.body;
    console.log(data.a.productID);
    console.log(data.b.userID);

    async function main() {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'testafisolve@gmail.com', // generated ethereal user
                pass: 'BuddhiRavihansa' // generated ethereal password
            },
        });

        let info = await transporter.sendMail({
            from: 'testafisolve@gmail.com', // sender address
            to: data.a.userEmail, // list of receivers
            subject: "Remove Account Coordinator", // Subject line
            text: "You have not complete providing solution for product Id"  + data.a.productID +" product's complaint. so, You have been remove from Account Coordinator of the " + data.a.productID + "product ID product", // plain text body
            html: "You have not complete providing solution for product Id"  + data.a.productID +" product's complaint. so, You have been remove from Account Coordinator of the " + data.a.productID + "product ID product", // html body
        });

        let info1 = await transporter.sendMail({
            from: 'testafisolve@gmail.com', // sender address
            to: data.b.userEmail, // list of receivers
            subject: "Remove Account Coordinator", // Subject line
            text: "You are the new Account Coordinator of the product Id" + data.a.productID +" product. so, You have to find the solution for product Id "  +data.a.productID +" product's complaints.", // plain text body
            html: "You are the new Account Coordinator of the product Id" + data.a.productID +" product. so, You have to find the solution for product Id "  +data.a.productID +" product's complaints.", // html body
        });


    }

    main().catch(console.error);

    try {
        const pool = await poolPromise;
        pool.request()
            .input('_cbc', sql.Int, data.b.userID)
            .input('_pdi', sql.Int, data.a.productID )
            .execute('updateAccountCoordinator', (error, result) => {
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

})

// reminder seen eka methana idn..............................................................


router.post('/update-reminder', verifyToken, async (request, response)=> {
    const data = request.body;
    const charithe= 'Project-Manager';
    const whaction= 'Reminder';
    console.log(data.complaintID);



    const acemail = data.userEmail;
    const comid = data.complaintID;
    console.log(acemail);


    // .............................................................
    async function main() {

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'testafisolve@gmail.com', // generated ethereal user
                pass: 'BuddhiRavihansa', // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'testafisolve@gmail.com', // sender address
            to: acemail, // list of receivers
            subject: "Reminder", // Subject line
            text: "You have not complete providing solution for "  + comid +" complaint. please, complete your work quickly", // plain text body
            html: "You have not complete providing solution for " + comid + " complaint. please, complete your work quickly", // html body
        });

        console.log("Message sent: %s", info.messageId);

    }

    main().catch(console.error);

    try {
        const pool = await poolPromise;
        pool.request()
            .input('_rem', sql.Int, data.productID)
            .input('_aon', sql.VarChar(40), data.firstName)
            .input('_sec', sql.VarChar(40), data.lastName)
            .input('_kan', sql.VarChar(20), charithe)
            .input('_wan', sql.VarChar(20), whaction)
            .execute('newreminder', (error, result) => {
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

})

router.get('/get-reminder-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        // pool.request()
        //     .query('select * from CHANGINGHISTORY \n' +
        //         'where wAction=\'Reminder\'', (error, result) => {
        //         if (error) {
        //             response.status(500).send({
        //                 status: false
        //             });
        //         } else {
        //             response.status(200).send({
        //                 status: true,
        //                 data: result.recordset
        //             });
        //         }
        //     });
    } catch (e) {
        response.status(500).send({status: false});
    }
});


//........................changinng history seen eka mmethana idn....................


router.post('/update-history-for-ac-change', verifyToken, async (request, response)=> {
    const data = request.body;
    const charithe1 = 'Project-Manager';
    const whaction1 = 'Change A.Coordinator';
    console.log(data)
    try {
        const pool = await poolPromise;
        pool.request()
            .input('_pon', sql.Int, data.a.productID)
            .input('_ton', sql.VarChar(40), data.a.firstName)
            .input('_sec', sql.VarChar(40), data.a.lastName)
            .input('_ban', sql.VarChar(20), charithe1)
            .input('_dan', sql.VarChar(20), whaction1)
            .input('_newton', sql.VarChar(40), data.b.firstName)
            .input('_newsec', sql.VarChar(40), data.b.lastName)
            .execute('newhistory', (error, result) => {
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

})


router.put('/update-history-new', verifyToken, async (request, response)=> {
    const data = request.body.accountCoordinatorName;
    console.log(data)
    try {
        // const pool = await poolPromise;
        // pool.request()
        //     .input('_son', sql.VarChar(40), data)
        //     .execute('updatehistory', (error, result) => {
        //         if (error) {
        //             response.status(500).send({
        //                 status: false
        //             });
        //
        //         } else {
        //             response.status(200).send({
        //                 status: true,
        //                 data: result.recordset
        //             });
        //         }
        //     });
    } catch (e) {
        response.status(500).send({status: false});
    }

})


//........................history seen eka

router.get('/get-full-history', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('\n' +
                '\n' +
                'SELECT \'0000\'+CAST(productID AS varchar(10)) as productID , submittedtime, preAcName, newAcName, exAcName, doneBy, action FROM CHANGINGHISTORY ', (error, result) => {
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


// ........................................................................................................
// (dash board ekta vena venama data gnna thana)

router.get('/get-full-count', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail )', (error, result) => {
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

router.get('/get-pending-count', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail) and c.status=\'0\' ', (error, result) => {
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

router.get('/get-working-count', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail) and c.status=\'1\' ', (error, result) => {
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

router.get('/get-finish-count', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail) and c.status=\'2\' ', (error, result) => {
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

router.get('/get-late-count', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail) and c.status=\'0\' and c.lastDateOfPending < GETDATE()', (error, result) => {
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

// -------------------------- no action -----------------------

router.get('/get-notaction-details', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('SELECT view_buddhi.*\n' +
                '    FROM view_buddhi\n' +
                '    WHERE NOT EXISTS(SELECT NULL\n' +
                '                         FROM CHANGINGHISTORY\n' +
                '                         WHERE CHANGINGHISTORY.productID = view_buddhi.productID \n' +
                '                        ) and view_buddhi.projectManagerEmail = @_pmEmail', (error, result) => {
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



//pending  and finish complaints
router.get('/get-complaint-pf', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and (c.status = \'0\' or c.status = \'2\') and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail)', (error, result) => {
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

//working and pending complaint
router.get('/get-complaint-wp', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and (c.status = \'0\' or c.status = \'1\') and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail)', (error, result) => {
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

///finish and working complaint
router.get('/get-complaint-fw', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
           .input('_pmEmail', sql.VarChar(50), request.payload.username)
           .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and (c.status = \'1\' or c.status = \'2\') and p.projectManagerID= (select userID from USERS where userEmail=  @_pmEmail)', (error, result) => {
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

router.post('/get-closed-complaints-countpm', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.projectManagerID= (select userID from USERS where userEmail= @_pmEmail) and c.status=3', (error, result) => {
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

//....................................... TIME EKT ANUWA COMPLAINT
router.get('/get-month-count', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('\n' +
                'SELECT TOP 5 count(*) as num, format(submittedDate, \'yyyy-MM\') as month\n' +
                'FROM COMPLAINT\n' +
                'GROUP BY format(submittedDate, \'yyyy-MM\')\n' +
                'order by 2 DESC', (error, result) => {
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
