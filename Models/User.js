//method to store individual user details

var User = function(UserID, firstName, lastName, emailAddress,password) {

    this.userId = UserID;
    this.firstName = firstName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
    this.Password = password;
  };

  module.exports = {
      UserDetails: User
  }
