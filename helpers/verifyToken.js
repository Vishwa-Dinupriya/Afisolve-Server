const jwt = require('jsonwebtoken');
const sql = require('mssql');
const {poolPromise} = require("./mssql-server-connection");

async function verifyToken(req, res, next) {
    if (!req.headers.authentication) {
        return res.status(401).send('Unauthorized request');
    }
    let token = req.headers.authentication.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send({
            status: false,
            message: 'Unauthorized request!!'
        });
    }
    try {
        let payload = jwt.verify(token, 'secretKey');
        if (!payload) {
            return res.status(401).send({
                status: false,
                message: 'Unauthorized request!!'
            });
        }
        const pool = await poolPromise;
        console.log(payload.userID);
        await pool.request()
            .input('userID', sql.Int, payload.userID)
            .input('time', sql.BigInt, +new Date())
            .execute('checkUserSession', (error, result) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send({
                        status: false,
                        message: 'Server error'
                    });
                } else {
                    console.log(result.recordset);
                    if (result.returnValue === 0) {
                        req.payload = payload; // attach the payload to request
                        next();
                    } else if (result.returnValue === 1) {
                        return res.status(408).send({
                            status: false,
                            message: 'Your session has timed out'
                        });
                    } else {
                        return res.status(401).send({
                            status: false,
                            message: 'Unauthorized request!!'
                        });
                    }
                }
            });

    } catch (exception) {
        console.log(exception)
        return res.status(401).send({
            status: false,
            message: 'Unauthorized request!!'
        });
    }

}

function verifyAdmin(req, res, next) {
    try {
        let role = req.payload.role;
        console.log('verifyAdmin: ' + role);
        if (role != 'admin') {
            return res.status(401).send({
                status: false,
                message: 'Unauthorized request!!'
            });
        }
        next();
    } catch (exception) {
        return res.status(401).send({
            status: false,
            message: 'Unauthorized request!!'
        });
    }
}


function verifyProjectManager(req, res, next) {
    try {
        let role = req.payload.role;
        console.log('this is the role: ' + role);
        if (role != 'project-manager') {
            return res.status(401).send({
                status: false,
                message: 'Unauthorized request!!'
            });
        }
        next();
    } catch (exception) {
        return res.status(401).send({
            status: false,
            message: 'Unauthorized request!!'
        });
    }
}

function verifyCustomer(req, res, next) {
    try {
        let role = req.payload.role;
        console.log('verifyCustomer: ' + role);
        if (role != 'customer') {
            return res.status(401).send({
                status: false,
                message: 'Unauthorized request!!'
            });
        }
        next();
    } catch (exception) {
        return res.status(401).send({
            status: false,
            message: 'Unauthorized request!!'
        });
    }
}


function verifyAccountCoordinator(req, res, next) {
    try {
        let role = req.payload.role;
        console.log('this is the role: ' + role);
        if (role != 'account-coordinator') {
            return res.status(401).send({
                status: false,
                message: 'Unauthorized request!!'
            });
        }
        next();
    } catch (exception) {
        return res.status(401).send({
            status: false,
            message: 'Unauthorized request!!'
        });
    }
}

function verifyDeveloper(req, res, next) {
    try {
        let role = req.payload.role;
        console.log('this is the role: ' + role);
        if (role != 'developer') {
            return res.status(401).send({
                status: false,
                message: 'Unauthorized request!!'
            });
        }
        next();
    } catch (exception) {
        return res.status(401).send({
            status: false,
            message: 'Unauthorized request!!'
        });
    }
}


module.exports = {
    verifyToken,
    verifyAdmin,
    verifyCustomer,
    verifyDeveloper,
    verifyAccountCoordinator,
    verifyProjectManager


}
