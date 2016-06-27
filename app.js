var express = require('express');
var mongoose = require('mongoose');
var fs = require('fs');
var async = require("async");
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var bodyParser  = require('body-parser');

mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('Problema ao conectar com a base de dados ' + config.database);
});

var app = express();
app.set('superSecret', config.secret); // secret variable
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

require('./src/model/usuario');
require('./src/model/hotel');
require('./src/model/oferta');
require('./src/model/emailRecebidoSite');
require('./src/model/contadores');
require('./src/model/filaEmail');

var api = express.Router();
require('./routes/route_api')(api);
app.use('/faleopreco-api', api);

var apiRoutes = express.Router();
require('./routes/route_secure')(apiRoutes, jwt);
app.use('/faleopreco-secure', apiRoutes);

app.listen(3000);
console.log('Listening on port 3000...');