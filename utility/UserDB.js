

var mongoose = require('mongoose');
var db = 'mongodb://localhost/Bikers';
var Schema = mongoose.Schema;

var User = require('./../models/User');
var userDb = mongoose.model('User', new Schema({ 
   userId: String,
   firstName: String,
   lastName: String,
   emailAddress: String,
   password: Object
}));

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).
catch(error => handleError(error));
//method to get list of user connections
var getUsers = async function () {
        var userArr = [];

        await userDb.find({}).exec().then((userList) => {
        userArr = userList;
        }).catch((err) => {
        console.log(err);
        });

        return userArr;
}
//method to get single user
var getUser = async function (USerId) {
    var userDetail;
    
    await userDb.findOne({
        userId: USerId}).exec().then((user) => {
            if (user) {
                userDetail = new User.UserDetails(user.userId,user.firstName,user.lastName,user.emailAddress,user.password );
            }
    }).catch((err) => {
        console.log(err);
     });
   
    return userDetail;
}
//method to get user based on email
var getUserBasedonEmail = async function (id) {
    var ID;
  
    await userDb.findOne({
        emailAddress: id
    }).exec().then((user) => {
        if (user) {
        ID = new User.UserDetails(user.userId,user.firstName,user.lastName,user.emailAddress, user.password );
    }
    }).catch((err) => {
        console.log(err);
     });
   
    return ID;
}

//method to register user
var registerUser = async function(user){

    var addNewUser = new userDb({
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress:user.emailAddress,
        password: user.Password
    });
 
    await addNewUser.save(function (err, addedConnection) {
        if (err) return console.error(err);
      });

}

module.exports = {
    getUser : getUser,
    getUsers: getUsers,
    getUserBasedonEmail : getUserBasedonEmail,
    registerUser : registerUser
};
