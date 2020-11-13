const express = require('express')
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');

const app1 = express()

app1.use(bodyParser.json());
app1.use(logger('dev'));
app1.use(cors());

const PORT1 = 3000
const api = require('./routes/api')

//=============================================
app1.use('/api', api);

//=============================================
app1.get('/', function (req, res) {
    res.send('Hello from server(1) ')
})

//======================  =======================
app1.listen(PORT1, function () {
    console.log('Server running on localhost:' + PORT1 )
});

