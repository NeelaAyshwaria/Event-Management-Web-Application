var express = require('express');
var router = express.Router();
var connectionDBUtil = require('./../utility/ConnectionDB');
var userConnection = require('./../models/UserConnection');
var userProfileObj = require('./../models/UserProfile');
var User = require('./../models/User');
var connectionObj = require('./../models/connection');
var userConnectionDBUtil = require('./../utility/UserConnectionDB');
var UserList = require('./../utility/UserDB');
var UserConItems = [];
var UserProfile;
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const { check, validationResult } = require('express-validator');

const { sanitizeBody } = require('express-validator');
// XSS filter
const helmet = require('helmet')
// Sets "X-XSS-Protection: 1; mode=block".
router.use(helmet.xssFilter())
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var encryptDecryptUtility = require('./../utility/PasswordChecker');


router.get('/',  async function (request, response) {
    if (request.session.theUser === undefined) {
    response.render('login',{session:request.session.theUser});    
    } else if (request.session.theUser) {
        console.log(request.session.theUser);
        UserConItems = await userConnectionDBUtil.userconnectionDetail(request.session.theUser.userId);   
        usercreatedCons = await connectionDBUtil.getuserCreatedConnections(request.session.theUser.emailAddress);
        UserProfile = new userProfileObj.UserProfile(request.session.theUser.userId, UserConItems,usercreatedCons);
        request.session.theUser.UserProfile = UserProfile;
        response.render('savedConnections', { data: request.session.theUser.UserProfile, session: request.session.theUser });
    }
});

//method to delete the saved connections


router.get('/dodelete', async function (req, res) {
    //if (req.body.formValue === 'Delete') 
    var connectionID;
    if(req.session.theUser){
        if (Object.keys(req.query)[0] === 'connectionID') {
            connectionID = req.query.connectionID;
            await UserProfile.removeConnection(connectionID);
            req.session.theUser.UserProfile = UserProfile;
            res.redirect('/mysavedConnections');
    }
}
});


router.get('/user/dodelete', async function (req, res) {
    //if (req.body.formValue === 'Delete') 
    var connectionID;
    if(req.session.theUser){
        if (Object.keys(req.query)[0] === 'connectionID') {
            connectionID = req.query.connectionID;
            await userConnectionDBUtil.removeUserCreatedConnection(connectionID);
            await connectionDBUtil.removeUsersConnection(connectionID);
            req.session.theUser.UserProfile = UserProfile;
            res.redirect('/mysavedConnections');
    }
}
});

//to update saved connections

router.get('/doupdate', function (req, res) {
    //if (req.body.formValue === 'Update') 
        var id;
        if (Object.keys(req.query)[0] === 'connectionID') {
            id = req.query.connectionID;
            res.redirect('/connection?connectionID='+id);
        }
    });


    
   // router.get('/user/doupdate', 
   router.get('/user/doupdate', urlencodedParser,     
   async function (req, res) {
    var id;
        if (Object.keys(req.query)[0] === 'connectionID') {
            id = req.query.connectionID;
            connectionObj = await connectionDBUtil.getConnection(id);       
            res.render('updateNewConnection', { session: req.session.theUser,data:connectionObj, error: null });
        }else{
            res.redirect('/');
        }
           
       }
      
   );

//to capture rsvp response of the user

router.get('/rsvp', async function (req, res) {
    var connectionID;
    console.log(req.query)
        if (Object.keys(req.query)[0] === 'connectionID') {
            connectionID = req.query.connectionID;
            console.log(req.query.rsvp);
            rsvp = req.query.rsvp;
            await UserProfile.addConnection(connectionID,rsvp);
            req.session.theUser.UserProfile = UserProfile;
            res.redirect('/mysavedConnections');

        }
});

//redirecting to home page once logout is clicked

router.get('/dologout', function (req, res) {
    UserConItems = [];
    UserProfile = undefined;
    req.session.theUser = undefined;
    res.redirect('/')


});

//validates the entries made to the login form 

router.post('/mylogin',urlencodedParser,sanitizeBody('notifyOnReply').toBoolean(),check('Username').isEmail().withMessage('Username should contain valid email address')
,check('Password').custom(value => {

    if(value === ''){
        return Promise.reject('Password cannot be empty'); 
    }else{

        var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

        if(mediumRegex.test(value)) {
            return true;
        } else {
            return Promise.reject('not valid password'); 
        }

    }
}), async function (request, response) {
    var errors = validationResult(request);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            response.render('login',{session:request.session.theUser,error:errors.array()});
        }else{

            if(request.session.theUser){
                response.redirect('/mysavedConnections');
            }else{
                //console.log("Inside else part");
                var user = await UserList.getUserBasedonEmail(request.body.Username);
               
                if(user){
                    console.log(user);
                    var decryptionedpswd = await encryptDecryptUtility.decrypt(user.Password);
                    if(decryptionedpswd === request.body.Password){
                        
                        request.session.theUser =  new User.UserDetails(user.userId, user.firstName, user.lastName,user.emailAddress, user.Password );
                        response.redirect('/mysavedConnections');
                    }else{
                        response.render('login',{session:request.session.theUser,error:[{
                            'msg': 'Username/Password is Invalid',
                          }]});         
                    }
                }else{
                    response.render('login',{session:request.session.theUser,error:[{
                        'msg': 'Username/Password is Invalid',
                      }]});
                }
            }

        }

});

//validates the entires made while signing up

router.post('/signup', urlencodedParser,sanitizeBody('notifyOnReply').toBoolean(),check('Username').custom(value => {
    if (value) {
        return /^[a-zA-Z0-9]*$/.test(value)
    } else {
        return Promise.reject('Userid cannot be empty');
    }
}).withMessage('Userid should contain only alphabets and Numbers'),
check('Username').custom(async (value,  { req }) => {
    if (value) {
        var usercheck = await UserList.getUser(value);
        if(usercheck){
            return Promise.reject('Userid already exists.');
        }else{
            return true;
        }
    } else {
        return true;
    }
}),
    check('Firstname').custom(value => {
        if (value) {
            return /^[a-zA-Z ]*$/.test(value)
        } else {
            return Promise.reject('First Name should not be empty');
        }
    }).withMessage('First Name should contain only alphabets'),

    check('Lastname').custom(value => {
        if (value) {
            return /^[a-zA-Z ]*$/.test(value)
        } else {
            return Promise.reject('Last Name should not be empty');
        }
    }).withMessage('Last Name should contain only alphabets'),

    check('Password').custom(value => {

        if(value === ''){
            return Promise.reject('Password cannot be empty'); 
        }else{
    
            var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    
            if(mediumRegex.test(value)) {
                return true;
            } else {
                return Promise.reject('not valid password'); 
            }
    
        }
    }),

    check('CheckPassword').custom((value, { req }) => {
        if (value) {
            console.log(req.body.Password);
            if (value != req.body.Password) {
                return Promise.reject('Passwords entered does not match');
            } else {
                return true;
            }
        } else {
            return Promise.reject('Please re enter checkpassword field');
        }
    }),
    check('email').isEmail().withMessage('Invalid email address'),
    check('email').custom(async (value,  { req }) => {
        if (value) {
            var userEmail = await UserList.getUserBasedonEmail(value);
            if(userEmail){
                return Promise.reject('Mail address already exists.');
            }else{
                return true;
            }
        } else {
            return true;
        }
    }),
    async function (req, res) {
        var err = await validationResult(req);
        if (!err.isEmpty()) {
            res.render('signup', { session: req.session.theUser, error: err.array() });
        } else {
            var password = await encryptDecryptUtility.encrypt(req.body.Password);
            var firstTimeUser = new User.UserDetails(req.body.Username, req.body.Firstname, req.body.Lastname,req.body.email, password );
            console.log(firstTimeUser);
            await UserList.registerUser(firstTimeUser);
            res.render('Login', { session: req.session.theUser, error: err.array()});
        }
    });




module.exports = {
    profController: router
}
