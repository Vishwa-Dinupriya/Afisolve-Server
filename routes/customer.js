const express = require('express')
const jwt = require('jsonwebtoken')
const fs = require("fs");
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');
const {verifyCustomer} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From authentication route');
});

//------------------------------------------------customer-complaint-----------------------------------------------------------------------------------
router.post('/lodge-complaint', verifyToken, verifyCustomer, async (request, response) => {

    const images = request.body.Images;
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_customerEmail', sql.VarChar(50), request.payload.username)
            .input('_productID', sql.Int, request.body.productID)
            .input('_description', sql.VarChar(5000), request.body.description)
            .input('_noOfImages', sql.Int, request.body.Images.length)
            .execute('lodgeComplaint', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false,
                        message: error
                    });
                } else {
                    if (result.recordsets[0].length !== 0) {
                        for (let i = 0; i < result.recordsets[0].length; i++) {
                            //encoding and save the picture to the local memory
                            const path = './pictures/complaint-pictures/' + result.recordsets[0][i].imageName;
                            const base64Data = images[i].replace(/^data:([A-Za-z-+/]+);base64,/, '');
                            fs.writeFileSync(path, base64Data, {encoding: 'base64'});
                        }
                    }
                    // console.log(JSON.stringify(result) + ' 75 admin.js');
                    response.status(200).send({
                        status: true,
                        message: 'Complaint Lodged! ',
                    });
                }
            });
    } catch (e) {
        console.log(e);
        response.status(500).send({status: false});
    }
});

router.post('/get-complaints-by-statusID', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    // console.log(request.body.statusID);
    try {
        pool.request()
            .input('_customerEmail', sql.VarChar(50), request.payload.username)
            .input('_reqComplaintsStatus', sql.Int, request.body.statusID)
            .execute('getCustomerComplaintsByStatusID', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    // console.log(JSON.stringify(result) + ' 56 customer.js');
                    let complaintElements = [];
                    for (let i = 0; i < result.recordsets[1].length; i++) {
                        complaintElements[i] = {
                            complaintID: result.recordsets[1][i].complaintID,
                            description: result.recordsets[1][i].description,
                            finishedDate: result.recordsets[1][i].finishedDate,
                            lastDateOfPending: result.recordsets[1][i].lastDateOfPending,
                            productID: result.recordsets[1][i].productID[0],
                            status: result.recordsets[1][i].status,
                            subComplaintID: result.recordsets[1][i].subComplaintID,
                            submittedDate: result.recordsets[1][i].submittedDate,
                            wipStartDate: result.recordsets[1][i].wipStartDate,
                            subComplaints: result.recordsets[0].filter(function (element) {
                                return element.complaintID === result.recordsets[1][i].complaintID;
                            })
                        }
                    }
                    // console.log(complaintElements);

                    response.status(200).send({
                        status: true,
                        data: complaintElements,
                        subComplaints: result.recordsets[0],
                        mainComplaints: result.recordsets[1],
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-selected-complaint-details', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_customerEmail', sql.VarChar(50), request.payload.username)
            .input('_complaintID', sql.Int, request.body.complaintID)
            .input('_subComplaintID', sql.Int, request.body.subComplaintID)
            .execute('getSelectedComplaintDetailsCustomer', (error, result) => {
                if (error) {
                    console.log('cannot run getSelectedComplaintDetailsCustomer');
                    response.status(500).send({
                        status: false
                    });
                } else {
                    if (result.returnValue === 0) {
                        console.log(JSON.stringify(result) + ' 118 customer.js');
                        let images = [];
                        const nImages = result.recordsets[5].length;
                        for (let i = 0; i < nImages; i++) {
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

router.post('/lodge-sub-complaint', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {

        pool.request()
            .input('_complaintID', sql.Int, request.body.complaintID_)
            .input('_subComplaintDesc', sql.VarChar(5000), request.body.subComplaint)
            .execute('lodgeSubComplaint', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    console.log(JSON.stringify(result) + ' 102 customer.js');
                    response.status(200).send({
                        status: true,
                        data: null
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});


//-------------------------------------------------customer-products------------------------------------------------------------------------------------------
router.post('/get-all-products', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_customerEmail', sql.VarChar(50), request.payload.username)
            .query('select * from PRODUCT where customerID= (select userID from USERS where userEmail=@_customerEmail)', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    console.log(JSON.stringify(result) + ' 75 admin.js');

                    response.status(200).send({
                        status: true,
                        data: result.recordset,
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});


//-------------------------------------------------customer-feedbacks------------------------------------------------------------------------------------------
router.post('/create-feedback', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    console.log(request.body)
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.body.complaintID_)
            .input('_feedback', sql.VarChar(5000), request.body.feedback)
            .input('_ratedValue', sql.Int, request.body.ratedValue)
            .execute('createFeedback', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    console.log('Feedback created successfully 131 admin.js');
                    response.status(200).send({
                        status: true
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

//-------------------------------------------------customer-comments---------------------------------------------------------------------------------------------------------

//--get comments for requested complaint ID
router.get('/get-comments', verifyToken, verifyCustomer, async (request, response) => {
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.query.complaintID)
            .input('_reqSenderUname', sql.VarChar(50), request.payload.username)
            .query('SELECT * FROM COMMENT C WHERE complaintID=@_complaintID ORDER BY C.submittedTime \n'+
                ' select userID from USERS U WHERE userEmail=@_reqSenderUname', (error, result) => {                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    console.log(JSON.stringify(result) + ' : 268 customer');
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
router.put('/save-comment_', verifyToken, verifyCustomer, async (request, response) => {
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


router.get('/get-feedback-countcus', verifyToken, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .query('SELECT  count(*) as num, satisfaction\n' +
                '                FROM FEEDBACK\n' +
                '                GROUP BY satisfaction\n' +
                '                order by 2 DESC', (error, result) => {
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

// ----------------------------------------Dashboard ekata data-----------

router.get('/get-full-count', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.customerID= (select userID from USERS where userEmail= @_pmEmail )', (error, result) => {
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

router.get('/get-pending-count', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.customerID= (select userID from USERS where userEmail= @_pmEmail) and c.status=\'0\' ', (error, result) => {
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

router.get('/get-working-count', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.customerID= (select userID from USERS where userEmail= @_pmEmail) and c.status=\'1\' ', (error, result) => {
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

router.get('/get-finish-count', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.customerID= (select userID from USERS where userEmail= @_pmEmail) and c.status=\'2\' ', (error, result) => {
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

router.get('/get-closed-count', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        pool.request()
            .input('_pmEmail', sql.VarChar(50), request.payload.username)
            .query('\n' +
                'select COUNT(*) as count from COMPLAINT c , PRODUCT p \n' +
                'where p.productID = c.productID and p.customerID= (select userID from USERS where userEmail= @_pmEmail) and c.status=\'3\' ', (error, result) => {
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
