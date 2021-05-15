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
          .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, \n' +
              'c.submittedDate, u.firstName, u.lastName, p.productID , c.lastDateOfPending, c.finishedDate, c.wipStartDate, \n' +
              '(select firstName from USERS where userID=p.projectManagerID) as pfirstName,\n' +
              '(select lastName from USERS where userID=p.projectManagerID) as plastName\n' +
              'from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u\n' +
              'where c.productID=p.productID \n' +
              'and c.status=s.statusID and u.userID=p.accountCoordinatorID and c.status != \'3\'', (error, result) => {
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
                '                  and c.lastDateOfPending < GETDATE()', (error, result) => {
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
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, \n' +
                'c.submittedDate, u.firstName, u.lastName, p.productID , c.lastDateOfPending, c.finishedDate, c.wipStartDate, \n' +
                '(select firstName from USERS where userID=p.projectManagerID) as pfirstName,\n' +
                '(select lastName from USERS where userID=p.projectManagerID) as plastName\n' +
                'from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u\n' +
                'where c.productID=p.productID \n' +
                'and c.status=s.statusID and u.userID=p.accountCoordinatorID and c.status != \'3\' and c.status = \'1\'', (error, result) => {
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
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, \n' +
                'c.submittedDate, u.firstName, u.lastName, p.productID , c.lastDateOfPending, c.finishedDate, c.wipStartDate, \n' +
                '(select firstName from USERS where userID=p.projectManagerID) as pfirstName,\n' +
                '(select lastName from USERS where userID=p.projectManagerID) as plastName\n' +
                'from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u\n' +
                'where c.productID=p.productID \n' +
                'and c.status=s.statusID and u.userID=p.accountCoordinatorID and c.status != \'3\' and c.status = \'2\'', (error, result) => {
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
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, \n' +
                'c.submittedDate, u.firstName, u.lastName, p.productID , c.lastDateOfPending, c.finishedDate, c.wipStartDate, \n' +
                '(select firstName from USERS where userID=p.projectManagerID) as pfirstName,\n' +
                '(select lastName from USERS where userID=p.projectManagerID) as plastName\n' +
                'from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u\n' +
                'where c.productID=p.productID \n' +
                'and c.status=s.statusID and u.userID=p.accountCoordinatorID and c.status != \'3\' and c.status = \'0\'', (error, result) => {
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
                user: 'info.afisolve@gmail.com', // generated ethereal user
                pass: 'codered09' // generated ethereal password
            },
        });

        let info = await transporter.sendMail({
            from: 'info.afisolve@gmail.com', // sender address
            to: data.a.userEmail, // list of receivers
            subject: "Remove as Account Coordinator", // Subject line
            text: "Dear Sir/Madam,\n" +
                "    You have not taken any action for providing solution for complaint of the complaint Id " + data.a.complaintID + " complain. Therefore, you have been removed as account coordinator of product id " + data.a.productID + ".\n"+
                "\n" +
                "    NOTE: If you have any issue, please contact the Project Manager of this product. \n" +
                "\n" +
                "    Best Regards,\n" +
                "    afi-Solve Complaint Management Unit,\n" +
                "    Afisol (Pvt) Ltd.   \n" +
                "_________________________________________________________________________ \n" +
                "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n"
        });

        let info1 = await transporter.sendMail({
            from: 'info.afisolve@gmail.com', // sender address
            to: data.b.userEmail, // list of receivers
            subject: "New Approval", // Subject line
            text: "Dear Sir/Madam,\n" +
                "    You have been selected as the new Account Coordinator of Product ID"+ data.a.productID +". Please pay attention to provide solutions to complaints of this product.\n" +
                "\n" +
                "    NOTE: If you have any issue, please contact the Project Manager of this product. \n" +
                "\n" +
                "    Best Regards,\n" +
                "    afi-Solve Complaint Management Unit,\n" +
                "    Afisol (Pvt) Ltd.  \n" +
                " _________________________________________________________________________ \n" +
                "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n"
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
                user: 'info.afisolve@gmail.com', // generated ethereal user
                pass: 'codered09', // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'info.afisolve@gmail.com', // sender address
            to: acemail, // list of receivers
            subject: "Reminder", // Subject line
            text: "Dear Sir/Madam,\n" +
                "    You have not taken any action for providing solution for complaint of the Complaint ID " + comid +" complaint. please, pay attention quickly for this complaint.\n" +
                "\n" +
                "    NOTE: If you have any issue, please contact the Project Manager of this product. \n" +
                "\n" +
                "    Best Regards,\n" +
                "    afi-Solve Complaint Management Unit,\n" +
                "    Afisol (Pvt) Ltd.   \n" +
                " _________________________________________________________________________ \n" +
                "    Disclaimer: This is a system-generated mail. For any queries, please contact the Company.\n"
        });
        console.log("Message sent: %s", info.messageId);

    }
    main().catch(console.error);

    //..........................................................................

    try {
        const pool = await poolPromise;
        pool.request()
            .input('_rem', sql.Int, data.productID)
            .input('_aon', sql.VarChar(40), data.firstName)
            .input('_sec', sql.VarChar(40), data.lastName)
            .input('_aoni', sql.Int, data.accountCoordinatorID)
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

//........................changinng history seen eka mmethana idn....................

router.post('/update-history-for-ac-change', verifyToken, async (request, response)=> {
    const data = request.body;
    const charithe1= 'CEO';
    const whaction1= 'Change A.Coordinator';
    console.log(data.b.userID)
    try {
         const pool = await poolPromise;
         pool.request()
             .input('_pon', sql.Int, data.a.productID)
             .input('_ton', sql.VarChar(40), data.a.firstName)
             .input('_sec', sql.VarChar(40), data.a.lastName)
             .input('_toni', sql.Int, data.a.accountCoordinatorID)
             .input('_ban', sql.VarChar(20), charithe1)
             .input('_dan', sql.VarChar(20), whaction1)
             .input('_newton', sql.VarChar(40), data.b.firstName)
             .input('_newsec', sql.VarChar(40), data.b.lastName)
             .input('_newtoni', sql.Int, data.b.userID)
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

//........................history seen eka

router.get('/get-full-history', verifyToken, async (request, response) => {
    const pool = await poolPromise;
    try {
         pool.request()
             .query('SELECT \'0000\'+CAST(productID AS varchar(10)) as productID , submittedtime, preAcName, newAcName, exAcName, doneBy, action \n' +
                 'FROM CHANGINGHISTORY\n' +
                 'order by submittedtime DESC', (error, result) => {
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
             .execute('getComplaintCount', (error, result) => {
                 if (error) {
                     console.log('cannot run getComplaintCount');
                     response.status(500).send({
                         status: false
                     });
                 } else {
                     response.status(200).send({
                         status: true,
                         data: {
                             alll: result.recordsets[0][0].alll,
                             pen: result.recordsets[1][0].pen,
                             work: result.recordsets[2][0].work,
                             fin: result.recordsets[3][0].fin,
                             clos: result.recordsets[4][0].clos
                         },
                     })
                 }
             })
         ;
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
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, \n' +
                'c.submittedDate, u.firstName, u.lastName, p.productID , c.lastDateOfPending, c.finishedDate, c.wipStartDate, \n' +
                '(select firstName from USERS where userID=p.projectManagerID) as pfirstName,\n' +
                '(select lastName from USERS where userID=p.projectManagerID) as plastName\n' +
                'from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u\n' +
                'where c.productID=p.productID \n' +
                'and c.status=s.statusID and u.userID=p.accountCoordinatorID and c.status != \'3\' and (c.status = \'0\' or c.status=\'2\')', (error, result) => {
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
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, \n' +
                'c.submittedDate, u.firstName, u.lastName, p.productID , c.lastDateOfPending, c.finishedDate, c.wipStartDate, \n' +
                '(select firstName from USERS where userID=p.projectManagerID) as pfirstName,\n' +
                '(select lastName from USERS where userID=p.projectManagerID) as plastName\n' +
                'from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u\n' +
                'where c.productID=p.productID \n' +
                'and c.status=s.statusID and u.userID=p.accountCoordinatorID and c.status != \'3\' and (c.status = \'0\' or c.status=\'1\')', (error, result) => {
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
            .query('select c.complaintID, c.subComplaintID, c.description, s.statusName, \n' +
                'c.submittedDate, u.firstName, u.lastName, p.productID , c.lastDateOfPending, c.finishedDate, c.wipStartDate, \n' +
                '(select firstName from USERS where userID=p.projectManagerID) as pfirstName,\n' +
                '(select lastName from USERS where userID=p.projectManagerID) as plastName\n' +
                'from  COMPLAINT c, PRODUCT p , COMPLAINT_STATUS s, USERS u\n' +
                'where c.productID=p.productID \n' +
                'and c.status=s.statusID and u.userID=p.accountCoordinatorID and c.status != \'3\'' +
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
module.exports = router;
