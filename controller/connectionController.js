var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var connectionDb = require('./../utility/ConnectionDB');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var connectionObj = require('./../models/connection');
var userConnectionDBUtil = require('./../utility/UserConnectionDB');
var random=require('random-int');
// XSS filter
const helmet = require('helmet')
// Sets "X-XSS-Protection: 1; mode=block".
router.use(helmet.xssFilter())
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

 //renders home page

router.get('/', function (req, res) {
    res.render('index',{session:req.session.theUser});
});

//renders signup form

router.get('/signup', async function (req, res) {
    res.render('signup',{session:req.session.theUser,error:null});

});

//renders login form

router.get('/login', async function (req, res) {
    res.render('login',{session:req.session.theUser,error:null});

});

//renders the page containing list of events

router.get('/connections', async function (req, res) {
    
    res.render('connections',{connections : await connectionDb.getConnections() , session:req.session.theUser});
    
});

//renders the page to create a new connection

router.get('/newConnection', function (req, res) {
    res.render('newConnection',{session:req.session.theUser,error:null});
});

//renders the list of connection choosed
router.get('/savedConnections', function (req, res) {
    res.render('savedConnections',{session:req.session.theUser});
});

//renders the index page 
router.get('/index', function (req, res) {
    res.render('index',{session:req.session.theUser});
});

//renders the about page
router.get('/about', function (req, res) {
    res.render('about',{session:req.session.theUser});
});

//renders the contact page

router.get('/contact', function (req, res) {
    res.render('contact',{session:req.session.theUser});
});

//renders the page containing details about event

router.get('/connection', async function (req, res) {
  var connectionID;
  if (Object.keys(req.query).length === 1) {
    CheckId(req, res);
  } else if (Object.keys(req.query).length === 0) {
    res.redirect('/connections');
  }
});

//method to validate adding new connection to list of connections

router.post('/user/doupdatenewcon', urlencodedParser,
check('topic').custom(value => /^[a-zA-Z0-9 ]+$/.test(value)).withMessage('Connection topic should be Alphanumeric and can contain spaces').isLength({ min: 5, max: 50 }).withMessage('Connection Topic (Min Length - 5, Max Length - 50)'),
    check('name').custom(value => /^[a-zA-Z ]*$/.test(value)).withMessage('Name should be alphabets and can contain spaces').isLength({ min: 10, max: 100 }).withMessage('Connection Name (Min Length - 10, Max Length - 100)'),
    check('details').custom(value => /^[a-zA-Z0-9 ]+$/.test(value)).withMessage('Connection details should be alphanumeric and can contain spaces').isLength({ min: 5, max: 50 }).withMessage('Connection details (Min Length - 5, Max Length - 50)'),
    check('location').custom(value => /^[a-zA-Z]+$/.test(value)).withMessage('Connection location should be alphabets and can contain spaces').isLength({ min: 5, max: 50 }).withMessage('Connection location (Min Length - 5, Max Length - 50)'),
async function (req, res) {
   
            var errors = validationResult(req);
        if (!errors.isEmpty()) {
            ConObj = new connectionObj.connect(req.body.id,req.body.name, req.body.topic,req.body.location,req.body.date, req.session.theUser.emailAddress);
            res.render('updateNewConnection', { session: req.session.theUser,data:ConObj, error: errors.array() });
    }else{
        console.log("sssss");
        var ConObj = new connectionObj.connect(req.body.id, req.body.name, req.body.topic,req.body.location,req.body.date, req.session.theUser.emailAddress);
      
        await connectionDb.updateNewConnection(ConObj);
        await userConnectionDBUtil.updateRespectiveConnectionDetails(ConObj);
        res.redirect('/connections');
    }
});

router.post('/addNewConnect', urlencodedParser,
check('topic').custom(value => /^[a-zA-Z0-9 ]+$/.test(value)).withMessage('Connection topic should be Alphanumeric and can contain spaces').isLength({ min: 5, max: 50 }).withMessage('Connection Topic (Min Length - 5, Max Length - 50)'),
    check('name').custom(value => /^[a-zA-Z ]*$/.test(value)).withMessage('Name should be alphabets and can contain spaces').isLength({ min: 10, max: 100 }).withMessage('Connection Name (Min Length - 10, Max Length - 100)'),
    check('details').custom(value => /^[a-zA-Z0-9 ]+$/.test(value)).withMessage('Connection details should be alphanumeric and can contain spaces').isLength({ min: 5, max: 50 }).withMessage('Connection details (Min Length - 5, Max Length - 50)'),
    check('location').custom(value => /^[a-zA-Z]+$/.test(value)).withMessage('Connection location should be alphabets and can contain spaces').isLength({ min: 5, max: 50 }).withMessage('Connection location (Min Length - 5, Max Length - 50)'),
    
async function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.render('newConnection',{session:req.session.theUser,error:errors.array()});
    }else{
        console.log(req.session.theUser);
        ConObj = new connectionObj.connect(random(500,999), req.body.name, req.body.topic,req.body.details,req.body.date, req.session.theUser.emailAddress);
        await connectionDb.addNewConnection(ConObj);
        res.redirect('/connections');
        
    }
   
});

//method to check if connection id is same as id in DB

var CheckId = async function (req, res) {
    var connectObj;
    if (Object.keys(req.query)[0] === 'connectionID') {
        connectionID = req.query.connectionID;
        connectObj = await connectionDb.getConnection(connectionID);
          if (connectObj) {
              res.render('connection',{con: connectObj,session:req.session.theUser});
          } else {
              res.render('connections',{connections : await connectionDb.getConnections(),session:req.session.theUser});
          }
        }else{
            res.render('connections',{connections : await connectionDb.getConnections(),session:req.session.theUser});
        }
    }

//method to validate the connection id format

var validateConnectionId = function (Id) {
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if((Id.match(letterNumber))) {
      return true;
     }
   else
     {
        console.log('not valid');
      return false;
     }
}


module.exports = {
    ConnectionRouter: router
}
