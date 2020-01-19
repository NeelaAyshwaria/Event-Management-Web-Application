//method to store type of connection and rsvp response for the connection 

var UserConnection = function(connection,rsvp){
    this.Connection = connection;
    this.rsvp = rsvp;
};

module.exports = {
    UserConnection: UserConnection
}
