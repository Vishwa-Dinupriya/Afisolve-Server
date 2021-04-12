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

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and p.projectManagerEmail=@_pmEmail', (error, result) => {
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
            .query('select c.complainID, p.productID, c.description, c.submittedDate, c.lastDateOfPending, a.accountCoordinatorName, a.accountCoordinatorEmail  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and c.lastDateOfPending < GETDATE() and c.status != \'finish\' and p.projectManagerEmail=@_pmEmail', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and c.status = \'working\' and p.projectManagerEmail=@_pmEmail', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and c.status = \'finish\' and p.projectManagerEmail=@_pmEmail', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and c.status = \'pending\' and p.projectManagerEmail=@_pmEmail', (error, result) => {
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
            .query('select * from ACCOUNT_COORDINATOR ', (error, result) => {
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
router.put('/update-name', verifyToken, async (request, response)=> {
    const data = request.body.accountCoordinatorEmail;
    try {
        const pool = await poolPromise;
        pool.request()
            .input('_cbc', sql.VarChar(50), data)
            .execute('newupdte', (error, result) => {
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

// ................................. old acc. coordiwa ayin kirima -------------------------

router.put('/old-name', verifyToken, async (request, response)=>{
    const data = request.body;
    const maile = data.accountCoordinatorEmail;
    const pdr = data.productID;



    async function main() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            // service: "gmail",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Admin: Complaint Management System" <foo@example.com>', // sender address
            to: maile, // list of receivers
            subject: "Remove Account Coordinator", // Subject line
            text: "You have not complete providing solution for "  + pdr +" product complaint. so, You have been remove from Account Coordinator of the " + pdr + "product ID product", // plain text body
            html: "You have not complete providing solution for "  + pdr +" product complaint. so, You have been remove from Account Coordinator of the " + pdr + "product ID product", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);

    try {
        const pool = await poolPromise;
        pool.request()
            .input('_mbc', sql.VarChar(10), data.productID)
            .execute('updte', (error, result) => {
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
    console.log(n);
})



// reminder seen eka methana idn..............................................................


router.post('/update-reminder', verifyToken, async (request, response)=> {
    const data = request.body;
    const charithe= 'Project-Manager';
    const whaction= 'Reminder';
    console.log(data)



    const acemailll = data.accountCoordinatorEmail;
    const comiddd = data.complainID;
    console.log(acemail);


    // .............................................................
    async function main() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            // service: "gmail",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Admin: Complaint Management System" <foo@example.com>', // sender address
            to: acemailll, // list of receivers
            subject: "Reminder", // Subject line
            text: "You have not complete providing solution for "  + comiddd +" complaint. please, complete your work quickly", // plain text body
            html: "You have not complete providing solution for " + comiddd+ " complaint. please, complete your work quickly", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);














    try {
        const pool = await poolPromise;
        pool.request()
            .input('_rem', sql.VarChar(10), data.productID)
            .input('_aon', sql.VarChar(40), data.accountCoordinatorName)
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
    const charithe1 = 'Project-Manager';
    const whaction1 = 'Change A.Coordinator';
    console.log(data)
    try {
        const pool = await poolPromise;
        pool.request()
            .input('_pon', sql.VarChar(10), data.productID)
            .input('_ton', sql.VarChar(40), data.accountCoordinatorName)
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


router.put('/update-history-new', verifyToken, async (request, response)=> {
    const data = request.body.accountCoordinatorName;
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

router.get('/get-full-count', verifyToken, verifyProjectManager, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('select COUNT(*) as count from COMPLAINT c , PRODUCT p where c.productID=p.productID and p.projectManagerEmail=@_pmEmail', (error, result) => {
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
            .query('select COUNT(*) as count from COMPLAINT c , PRODUCT p where c.productID=p.productID and p.projectManagerEmail=@_pmEmail and c.status=\'pending\'', (error, result) => {
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
            .query('select COUNT(*) as count from COMPLAINT c , PRODUCT p where c.productID=p.productID and p.projectManagerEmail=@_pmEmail and  c.status=\'working\'', (error, result) => {
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
            .query('select COUNT(*) as count from COMPLAINT c , PRODUCT p where c.productID=p.productID and p.projectManagerEmail=@_pmEmail and c.status=\'finish\'', (error, result) => {
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
            .query('select COUNT(*) as count from COMPLAINT c , PRODUCT p where c.productID=p.productID and p.projectManagerEmail=@_pmEmail and  c.lastDateOfPending < GETDATE() AND c.status != \'finish\' \n', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and p.projectManagerEmail=@_pmEmail and  (c.status = \'finish\' or c.status = \'pending\')', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and p.projectManagerEmail=@_pmEmail and (c.status = \'working\' or c.status = \'pending\')', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and p.projectManagerEmail=@_pmEmail and (c.status = \'working\' or c.status = \'finish\')', (error, result) => {
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



/// .....................................get message

router.get('/get-message', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('SELECT * FROM MESSAGE m\n' +
                'ORDER BY m.sendtime', (error, result) => {
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



////----------------------------------type msg---------------------------------
router.put('/send-msg', verifyToken, async (request, response)=> {
    const data = request.body.massege;
    const sen= 'projectManager';
    console.log(data)
    try {
        const pool = await poolPromise;
        pool.request()
            .input('_rem', sql.VarChar(200), data)
            .input('_senn', sql.VarChar(20), sen)
            .execute('newmsg', (error, result) => {
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



module.exports = router;
