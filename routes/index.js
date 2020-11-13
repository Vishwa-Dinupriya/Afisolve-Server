var express = require('express');
var router = express.Router();

const {poolPromise1} = require('../helpers/mssql-server-connection');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'index route' });
});

router.get('/db', async function(req, res, next) {
  const pool = await poolPromise1;
  await pool.request()
      .query('SELECT * FROM table_name', (error, result) => {
        if (error) {
          console.log(error);
        } else {
          console.log(result);
          res.send(JSON.stringify(result));
        }
      });
});

module.exports = router;
