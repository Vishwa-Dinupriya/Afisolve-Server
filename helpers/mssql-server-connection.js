const sql = require('mssql');

const config = {
    server: 'localhost',
    instance: 'MSSQLSERVER',
    user: 'vishwa',
    password: '12345',
    database: 'afisolve',
    options: {
        enableArithAbort: true,
        encrypt: false
    }
}

const poolPromise = new sql.ConnectionPool(config).connect().then(pool => {
    console.log('Successfully connected to MSSQL Server');
    return pool;
}).catch(error => console.log(error));

module.exports = {
    sql, poolPromise
}
