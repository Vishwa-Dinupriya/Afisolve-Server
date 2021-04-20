const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const nodemailer = require('nodemailer');

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');

const fs = require('fs');


router.get('/', (req, res) => {
    res.send('From ceo route');
});

///---------------------------------------------------------------------------------------------------------------------

// -----------------------grt reports----------------

router.get('/get-complaint-details1', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
          .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID', (error, result) => {
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

//--------------------------------------------late complaints-------------------------------------------------
router.get('/get-complaint-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select * from view_buddhi', (error, result) => {
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
router.get('/get-complaint-det', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and c.status = \'1\'', (error, result) => {
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
router.get('/get-complaint-de', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and c.status = \'2\'', (error, result) => {
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
router.get('/get-complaint-detai', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and c.status = \'0\'', (error, result) => {
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

///Account coordinators lage names ganima........

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



//---------------------------------------------- new acc co-------------------------

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
    const charithe= 'CEO';
    const whaction= 'Reminder';
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








    //..........................................................................




    try {
        const pool = await poolPromise;
        pool.request()
            .input('_rem', sql.VarChar(10), data.productID)
            .input('_aon', sql.VarChar(40), data.firstName)
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
        pool.request()
             .query('select * from CHANGINGHISTORY \n' +
                 'where wAction=\'Reminder\'', (error, result) => {
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


//........................changinng history seen eka mmethana idn....................


router.put('/update-history-previous', verifyToken, async (request, response)=> {
    const data = request.body;
    const charithe1= 'CEO';
    const whaction1= 'Change A.Coordinator';
    console.log(data)
    try {
         const pool = await poolPromise;
         pool.request()
            .input('_pon', sql.VarChar(10), data.productID)
            .input('_ton', sql.VarChar(40), data.firstName)
            .input('_ban', sql.VarChar(20), charithe1)
            .input('_dan', sql.VarChar(20), whaction1)
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

//----------------------aluth acc di history update-----------------

router.put('/update-history-new', verifyToken, async (request, response)=> {
    const data = request.body.firstName;
    console.log(data)
    try {
         const pool = await poolPromise;
         pool.request()
            .input('_son', sql.VarChar(40), data)
             .execute('updatehistory', (error, result) => {
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

//---------------------------no action-----------------------------------------------

router.get('/get-notaction-details', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
             .query('SELECT view_buddhi.*\n' +
                 '    FROM view_buddhi\n' +
                 '    WHERE NOT EXISTS(SELECT NULL\n' +
                '                         FROM CHANGINGHISTORY\n' +
                 '                         WHERE CHANGINGHISTORY.productID = view_buddhi.productID \n' +
                '                        )', (error, result) => {
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


//........................history seen eka

router.get('/get-full-history', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select * from CHANGINGHISTORY', (error, result) => {
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

router.get('/get-full-count', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select COUNT(*) as count from COMPLAINT', (error, result) => {
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

router.get('/get-pending-count', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select COUNT(*) as count from COMPLAINT where status=\'0\'', (error, result) => {
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

router.get('/get-working-count', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select COUNT(*) as count from COMPLAINT where status=\'1\'', (error, result) => {
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

router.get('/get-finish-count', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select COUNT(*) as count from COMPLAINT where status=\'2\'', (error, result) => {
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

router.get('/get-late-count', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select COUNT(*) as count from COMPLAINT  where COMPLAINT.lastDateOfPending < GETDATE() AND COMPLAINT.status = \'0\' \n', (error, result) => {
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
router.get('/get-complaint-pf', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and (c.status = \'0\' or c.status=\'2\')', (error, result) => {
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
router.get('/get-complaint-wp', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID  and (c.status = \'0\' or c.status=\'1\')', (error, result) => {
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
router.get('/get-complaint-fw', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
         pool.request()
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, c.submittedDate, u.firstName from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u where c.productID=p.productID and c.status=s.statusID and u.userID=p.accountCoordinatorID' +
                ' and (c.status = \'1\' or c.status=\'2\')', (error, result) => {
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

router.post('/get-closed-complaints-countceo', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select count(*) as count from COMPLAINT where status= \'3\'', (error, result) => {
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
