'use strict';

require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const sequelize = require('./config/database');
const oas3Tools = require('oas3-tools');
const inicializarAdmin = require('./controllers/criarAdmin');
const inicializarEscaloes = require('./controllers/criarEscalao');

const serverPort = 8080;

process.on('unhandledRejection', (err) => {
    console.error(err);
})
process.on('uncaughtException', (err) => {
    console.error(err);
})

var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

const app = express();

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store'); 
    next();
});

app.use(express.json());
app.use(cors());

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var openApiApp = expressAppConfig.getApp();
app.use(openApiApp);

http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

sequelize.sync()
    .then(async () => {
        await inicializarAdmin();
        await inicializarEscaloes();
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });