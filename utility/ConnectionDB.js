var mod = require('./../models/connection');
var mongoose = require('mongoose');
var db = 'mongodb://localhost/Bikers';
var Schema = mongoose.Schema;
//creating connection model
var connectionsDb = mongoose.model('Connection', new Schema({ 
    ConnectionID: String,
    ConnectionName: String,
    ConnectionTopic: String,
    Details: String,
    dateandTime: String,
    host:String
  }));

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).
catch(error => handleError(error));

//method to fetch the list of connections
var getConnections = async function () {
    var list = [];

    await connectionsDb.find({}).exec().then((connection) => {
    list = connection;
    }).catch((err) => {
        console.log(err);
 });

    return list;
}

//method to display that one connection based on connection id
var getConnection = async function (UserId) {
    var conObj;
    await connectionsDb.findOne({ConnectionID: UserId}).exec().then((conn) => {
    conObj = new mod.connect(conn.ConnectionID, conn.ConnectionName, conn.ConnectionTopic,conn.Details, conn.dateandTime);
    }).catch((err) => {
        console.log(err);
    });
    return conObj;

};


//adding new event or connection to the list of existing connection
 var addNewConnection = async function (Obj) {
   
    var addNewConnection = new connectionsDb({
        ConnectionID : Obj.ConnectionID,
        ConnectionName : Obj.ConnectionName,
        ConnectionTopic : Obj.ConnectionTopic,
        Details : Obj.Details,
        dateandTime : Obj.date,
        host:Obj.host

    });
 
    await addNewConnection.save(function (err, addedConnection) {
        if (err) return console.error(err);
      });

}

var getuserCreatedConnections = async function (email) {
    var userCon = [];
    console.log(email)
    await connectionsDb.find({host: email}).exec().then((userobj) => {
    userCon = userobj;
    }).catch((err) => {
        console.log(err);
    });

    return userCon;
}

//deletes the connection 
var removeUsersConnection = async function(connectionID){
    await connectionsDb.deleteOne({ ConnectionID : connectionID }, function (err) {
        if (err) return handleError(err);
      });
}

var updateNewConnection = async function (connectionObj) {

  console.log(connectionObj);
await connectionsDb.findOneAndUpdate(
        { ConnectionID: connectionObj.ConnectionID },
        { $set: { ConnectionName: connectionObj.ConnectionName,ConnectionTopic: connectionObj.ConnectionTopic
            ,Details:connectionObj.Details,dateandTime : connectionObj.date} }
    ).exec().then((userConnection) => {
        if(userConnection){
            updation = true;
        }
     }).catch((err) => {
        console.log(err);
    });
         
    return updation;
}



module.exports.getConnection = getConnection;
module.exports.getConnections = getConnections;
module.exports.addNewConnection = addNewConnection;
module.exports.getuserCreatedConnections = getuserCreatedConnections;
module.exports.removeUsersConnection = removeUsersConnection;
module.exports.updateNewConnection=updateNewConnection;