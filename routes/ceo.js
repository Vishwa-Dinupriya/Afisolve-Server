const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

router.get('/', (req, res) => {
    res.send('From ceo route');
});

module.exports = router;
