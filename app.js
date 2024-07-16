const express = require('express');
const app = express();
const routes = require('./router/router.js');
const config = require('./config/config')
const path=require('path')
const database=require('./config/database.js')

const ejs=require('ejs');
const { log } = require('console');
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
app.set('views','./views');

app.use(cookieParser())

app.use('/',routes)

const port = 3000;

app.listen(port, () => {
  console.log('App listening on port ' + port);
});