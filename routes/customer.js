const express = require('express')
const jwt = require('jsonwebtoken')
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

    const pool = await poolPromise;
    console.log(request.body)
    try {
        pool.request()
            .input('_customerEmail', sql.VarChar(50), request.payload.username)
            .input('_productID', sql.Int, request.body.productID)
            .input('_description', sql.VarChar(5000), request.body.description)
            .execute('lodgeComplaint', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    console.log(JSON.stringify(result) + ' 75 admin.js');
                    response.status(200).send({
                        status: true
                    });
                }
            });
    } catch (e) {
        response.status(500).send({status: false});
    }
});

router.post('/get-complaints-by-statusID', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    console.log(request.body.statusID);
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
                    console.log(JSON.stringify(result) + ' 56 customer.js');
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
                    console.log(complaintElements);

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

router.post('/lodge-sub-complaint', verifyToken, verifyCustomer, async (request, response) => {

    const pool = await poolPromise;
    try {
        console.log(request.body);
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
            .query('select * from PRODUCT where customerEmail=@_customerEmail', (error, result) => {
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
    console.log(request.payload);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_complaintID', sql.Int, request.query.complaintID)
            .query('SELECT * FROM COMMENT C WHERE complaintID=@_complaintID ORDER BY C.submittedTime ', (error, result) => {
                if (error) {
                    console.log(error);
                    response.status(500).send({
                        status: false
                    });
                } else {
                    let comments = [];
                    let textOrImage;
                    let avatarPicture;
                    const nComments = result.recordsets[0].length;
                    for (let i = 0; i < nComments; i++) {
                        if (result.recordsets[0][i].isImage == true) {
                            try {//get the picture to 'img' from local memory
                                textOrImage = fs.readFileSync('./pictures/comment-pictures/' + result.recordsets[0][i].textOrImageName, {encoding: 'base64'})
                            } catch (error) {
                                textOrImage = fs.readFileSync('./pictures/profile-pictures/default-profile-picture.png', {encoding: 'base64'});
                            }
                        } else { // when comment is not an image
                            textOrImage = result.recordsets[0][i].textOrImageName
                        }
                        if (result.recordsets[0][i].senderEmail !== request.payload.username) {
                            console.log(result.recordsets[0][i].senderEmail);
                            try {//get the picture to 'img' from local memory
                                avatarPicture = fs.readFileSync('./pictures/profile-pictures/' + result.recordsets[0][i].senderEmail + '.png', {encoding: 'base64'})
                            } catch (error) {
                                avatarPicture = fs.readFileSync('./pictures/profile-pictures/default-profile-picture.png', {encoding: 'base64'});
                            }
                        } else { // when comment is not an image
                            avatarPicture = null;
                        }
                        comments[i] = {
                            IsImage: result.recordsets[0][i].isImage,
                            content: textOrImage,
                            senderEmail: result.recordsets[0][i].senderEmail,
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
                    console.log(JSON.stringify(result) + '330 customer');
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


module.exports = router;
