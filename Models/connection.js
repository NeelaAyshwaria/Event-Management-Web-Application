//method to store the event or connection details

var connect = function(ConnectionID,ConnectionName,ConnectionTopic,Details,date,host){
    this.ConnectionID = ConnectionID;
    this.ConnectionName= ConnectionName;
    this.ConnectionTopic= ConnectionTopic;
    this.Details= Details;
    this.date = date;
    this.host = host
  };
  module.exports = {
      connect: connect
  }
