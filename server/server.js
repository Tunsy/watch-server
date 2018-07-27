const express = require('express');
const mainController = require('./controllers/mainController');
const app = express();
const PORT = process.env.PORT || 5000;

// Fire controllers
app.use(express.static('./public'));
mainController(app);

// Port
app.listen(PORT);
console.log('listening on ' + PORT);
 