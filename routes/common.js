const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const fs = require('fs');

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const {verifyToken} = require('../helpers/verifyToken');

router.get('/', (req, res) => {
    res.send('From users route');
});

router.post('/home/user-display-details', verifyToken, async (request, response) => {
    console.log(request.payload.username);
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_username', sql.VarChar(50), request.payload.username)
            .execute ('userLoginDetails', (error, result) => {
                if (error) {
                    response.status(500).send({
                        status: false
                    });
                } else {
                    // console.log(JSON.stringify(result));
                    // console.log(result.recordsets[0][0].firstName);
                    // console.log(JSON.stringify(result.recordsets[1]));
                    response.status(200).send({
                        status: true,
                        firstname: result.recordsets[0][0].firstName,
                        roles:result.recordsets[1]
                    })
                }
            });
    } catch (e) {
        response.status(500).send(
            {
                status: false
            }
        )
    }
});

router.post('/get-profile-picture', verifyToken, async (request, response) => {

    try {
        const image = fs.readFileSync('./profile-pictures/' + request.uname + '.png', {encoding: 'base64'});
        response.status(200).send({
            status: true,
            profilePicture: image
        });
    } catch (error) {
        if (error.errno === -4058) {
            const image = fs.readFileSync('./profile-pictures/default.png', {encoding: 'base64'});
            response.status(200).send({
                status: true,
                profilePicture: image
            });
        } else {
            response.status(500).send(Errors.serverError);
        }
    }

});

router.post('/upload-profile-picture', verifyToken, async (request, response) => {

    const image = request.body.profilePicture;

    try {
        if (!image) {
            response.status(401).send({
                status: false,
                message: 'Image not found'
            });
        } else {
            const path = './profile-pictures/' + request.uname + '.png';
            const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
            fs.writeFileSync(path, base64Data, {encoding: 'base64'});
            response.send({
                status: true,
                message: 'profile picture updated successfully'
            });
        }
    } catch (error) {
        response.status(500).send(Errors.serverError);
    }

});

module.exports = router;
