const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const nodemailer = require('nodemailer');

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From ceo route');
});


router.get('/get-complaint-details1', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail ', (error, result) => {
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

//---------------------------------------------------------------------------------------------
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and c.status = \'working\'\n', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and c.status = \'finish\'\n', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and c.status = \'pending\'\n', (error, result) => {
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



//-------------------------------------------time wise gnna eka

//this year

router.get('/get-complaint-year', verifyToken, async(request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from COMPLAINT \n' +
                'where submittedDate > DATEADD(month, -1,GETDATE())', (error, result) => {
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

///this month

router.get('/get-complaint-month', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from COMPLAINT \n' +
                'where submittedDate > DATEADD(month, -1,GETDATE())', (error, result) => {
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

///today
router.get('/get-complaint-today', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from COMPLAINT \n' +
                'where cast(submittedDate as Date) = cast(getdate() as date)\n ', (error, result) => {
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

//--------------------------------------------------------------------------------------------------

//router.post('/update-name', async (request, response) => {
//console.log(request.body);
//});

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



router.put('/old-name', verifyToken, async (request, response)=>{
    const data = request.body.productID;
    var n=(data)

    try {
        const pool = await poolPromise;
        pool.request()
            .input('_mbc', sql.VarChar(10), data)
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
    const charithe= 'CEO';
    const whaction= 'Reminder';
    const acemail = data.accountCoordinatorEmail;
    const comid = data.complainID;
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
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: acemail, // list of receivers
            subject: "Reminder", // Subject line
            text: "You have not complete providing solution for "  + {comid} +" complaint. please, complete your work quickly", // plain text body
            html: "You have not complete providing solution for " + {comid} + " complaint. please, complete your work quickly", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);








    //..........................................................................




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

router.post('/update-time', verifyToken, async (request, response)=> {
    const data = request.body;
    console.log(data)
    try {
        const pool = await poolPromise;
        pool.request()
            .input('_tm', sql.Int, data)
            .execute('newtime', (error, result) => {
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
            .query('select COUNT(*) as count from COMPLAINT where status=\'pending\'', (error, result) => {
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
            .query('select COUNT(*) as count from COMPLAINT where status=\'working\'', (error, result) => {
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
            .query('select COUNT(*) as count from COMPLAINT where status=\'finish\'', (error, result) => {
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
            .query('select COUNT(*) as count from COMPLAINT  where COMPLAINT.lastDateOfPending < GETDATE() AND COMPLAINT.status != \'finish\' \n', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and (c.status = \'finish\' or c.status = \'pending\')', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and (c.status = \'working\' or c.status = \'pending\')', (error, result) => {
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
            .query('select c.complainID, c.subComplaintID, p.productID, c.description, c.status, c.submittedDate, a.accountCoordinatorName  from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
                'where c.productID=p.productID and p.accountCoordinatorEmail=a.accountCoordinatorEmail and (c.status = \'working\' or c.status = \'finish\')', (error, result) => {
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
