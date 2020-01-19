var express = require('express');
var app = express();
var connectionDb = require('./utility/ConnectionDB');
app.set('view engine','ejs');
app.use('/styles', express.static('styles'));
app.use('/images', express.static('images'));
// XSS filter
const helmet = require('helmet')
// Sets "X-XSS-Protection: 1; mode=block".
app.use(helmet.xssFilter())
var session = require('express-session');
app.use(session({secret : 'ayshusession'}));
var connectionRouter = require('./controller/connectionController');
var profile_Router = require('./controller/profileController');
//connection controller
app.use('/', connectionRouter.ConnectionRouter);
//profile controller
app.use('/mysavedConnections', profile_Router.profController);
app.get('/*',function(req,res){
    res.redirect('/');
});
app.listen(8080);
console.log('Listening to the port 8080');

var UserProfile = require('./models/UserProfile');
var userConnection = require('./models/UserConnection');
var userlist = require('./utility/UserDB');
var connectionDBUtil = require('./utility/ConnectionDB');

