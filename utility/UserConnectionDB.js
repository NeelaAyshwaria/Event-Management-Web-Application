var object = require('./../models/connection');
var mongoose = require('mongoose');
var db = 'mongodb://localhost/Bikers';
var Schema = mongoose.Schema;


//model creation for the user
var userConnectionsDb = mongoose.model('Userconnection', new Schema({ 
   userId: String,
   ConnectionID: String,
   connectionName:String,
   rsvp: String, 
}));

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).
catch(error => handleError(error));

//returns the list of user connections
var getUserProfile = async function (ID) {
    var userCon = [];
    console.log(ID)
    await userConnectionsDb.find({userId: ID}).exec().then((userobj) => {
    userCon = userobj;
    }).catch((err) => {
        console.log(err);
    });

    return userCon;
}


//adds the user response to an event
var addRsvp = async function (connectionObj, userID, rsvp) {
    console.log("addrsvp"+connectionObj+userID+rsvp);

    var adduserConnection = new userConnectionsDb({
        userId: userID,
        ConnectionID: connectionObj.ConnectionID,
        connectionName: connectionObj.ConnectionName,
        //connectionType: connectionObj.Details,
        rsvp: rsvp
    });
 
    await adduserConnection.save(function (err, addedConnection) {
        if (err) return console.error(err);
      }); 
}


//updates the user response to an event
var updateRsvp = async function (connectionID, userID, rrsvp) {
console.log("update"+connectionID+ userID+rsvp)
    var j = false; 
    await userConnectionsDb.findOneAndUpdate(
        { userId: userID,ConnectionID: connectionID },
        { $set: { rsvp: rrsvp } }
    ).exec().then((userConnection) => {
        console.log("skkn");
        if(userConnection){
            console.log(userConnection);
            j = true;
        }
     }).catch((err) => {
        console.log(err);
    });
         
    return j;
}

//deletes the connection 
var removeUserConnection = async function(connectionID, userID){
    await userConnectionsDb.deleteOne({ userId : userID , ConnectionID : connectionID }, function (err) {
        if (err) return handleError(err);
      });
}

//deletes the connection 
var removeUserCreatedConnection = async function(connectionID){
    await userConnectionsDb.deleteMany({ ConnectionID : connectionID }, function (err) {
        if (err) return handleError(err);
      });
}

//updates indvidual user updates to the events
var updateRespectiveConnectionDetails = async function (connectionObj) {

    
    
    await userConnectionsDb.updateMany(
            { ConnectionID: connectionObj.ConnectionID },
            { $set: {  connectionName:connectionObj.ConnectionName} }
        ).exec().then((userConnection) => {
            if(userConnection){
                updation = true;
            }
         }).catch((err) => {
            console.log(err);
        });
             
    }

module.exports = {
    userconnectionDetail : getUserProfile,
    updateUserConnection : updateRsvp,
    addUserConnection : addRsvp,
    removeUserConnection : removeUserConnection,
    removeUserCreatedConnection:removeUserCreatedConnection,
    updateRespectiveConnectionDetails : updateRespectiveConnectionDetails
};