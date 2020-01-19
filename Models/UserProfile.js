var userConnection = require('./UserConnection');
var connectionDBUtil = require('./../utility/ConnectionDB');
var userConnectionDBUtil = require('./../utility/UserConnectionDB');

//method to add a new user connection to a particular user
var UserProfile = function (UserID, UserConnection, userCreatedCons) {
       this.UserId = UserID;
       this.UserConnectionList = UserConnection;
       this.userCreatedCons = userCreatedCons;

       this.addConnection = async function (connection, rsvp) {
           var i = 0;
           var Obj;

           if (this.UserConnectionList == undefined || this.UserConnectionList.length == 0) {
              
               Obj = await connectionDBUtil.getConnection(connection);
               await userConnectionDBUtil.addUserConnection(Obj,this.UserId,rsvp);
           
           } else {
               
               Obj = await connectionDBUtil.getConnection(connection);
               i = await this.updateConnection(new userConnection.UserConnection(Obj, rsvp));
               if (i === false) {
               await userConnectionDBUtil.addUserConnection(Obj,this.UserId,rsvp);
              }
            }
      }
      //returns the list of connetion of the user
       this.getConnections = async function () {
           this.UserConnectionList=await userConnectionDBUtil.userconnectionDetail(this.UserId);
           return this.UserConnectionList;
       }

       //remove the connection based on rsvp
       this.removeConnection = async function(connectionId) {
        await userConnectionDBUtil.removeUserConnection(connectionId,this.UserId);
           }
       this.updateConnection = async function (UserConnection){
             // updates the connection data
             var i = false;
             
             console.log(UserConnection)
             update = await userConnectionDBUtil.updateUserConnection(UserConnection.Connection.ConnectionID,this.UserId,UserConnection.rsvp);
             console.log(update);
             return update;
            }

    //retuns empty list if no connections are added
     this.emptyProfile = function (){
             this.UserConnectionList = [];
         }
 };
 
module.exports = {
   UserProfile: UserProfile
}
