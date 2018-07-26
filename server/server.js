const express = require('express');
const mainController = require('./controllers/mainController');
const app = express();

// Template engine
app.set('view engine', 'ejs');

// Fire controllers
app.use(express.static('./public'));
mainController(app);

// Port
app.listen(3000);
console.log('listening on 3000')
