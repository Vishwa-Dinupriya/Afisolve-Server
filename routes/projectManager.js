const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From authentication route');
});
//--------------------------------------------------view reports

router.get('/get-complaint-details1', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('select * from  COMPLAINT c, PRODUCT p, ACCOUNT_COORDINATOR a\n' +
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
            .query('select * from COMPLAINT where status = \'working\'\n', (error, result) => {
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
            .query('select * from COMPLAINT where status = \'finish\'\n', (error, result) => {
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
            .query('select * from COMPLAINT where status = \'pending\'\n', (error, result) => {
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
    //console.log(request.body);
    const data = request.body
    console.log(data.accountCoordinatorEmail)
    response.status(200).send({"message": "Data recieved"});

})



router.post('/old-name', verifyToken, async (request, response)=>{
    const data = request.body.accountCoordinatorName
    console.log(request.body.accountCoordinatorName + ' projectManager.js 252');
    //const m=(data.accountCoordinatorEmail)
    const n=(data)
    //console.log(m)
    console.log(n)

    //try {
       // const pool = await poolPromise;
      //  await pool.request()
          //  .input('_olden', sql.VarChar(40), data.accountCoordinatorName)
           // .execute('UpdateStoredProcedureSecondExample', (error, result) => {
              //  if (error) {
                   // console.log(error);
                  //  response.status(500).send({
                    //    status: false,
                   //     message: 'query Error..!'
                 //   });
             //   } else {
                  //  console.log(result);
                  //  if (result.returnValue === 0) {
                      //  console.log('Data Successfully Updated!');
                     //   response.status(200).send({
                        //    status: true,
                         //   message: 'Data Successfully Updated!'
                      //  });
                  //  } else {
                     //   response.status(500).send({message: 'from error handler'});
                  //  }
             //   }
          //  });
  //  } catch (error) {
    //    console.log(error);
     //   response.status(500).send({
        //    status: false,
         //   message: 'DB connection Error..!'
      //  });
        //  }
   

})









//.........................................................................



module.exports = router;
