var _ = require('underscore');

module.exports = function(io) {
  var self = this;
  self.io = io;
  self.users = [];

  self.run = function() {
    self.io.on('connection', function(socket){
      console.log('a user connected');
      debugger;

      self.handleConnection(socket);

      socket.on('disconnect', function(){
        console.log('user disconnected');
      });

      socket.on('message', function(msg){
        console.log('message: ' + msg);
        self.broadcastToUsers('message', msg);
      });
    });
  }

  self.handleConnection = function(socket) {
    socket.on('username', function(name) {
      var nameBad = !name || name.length < 3 || name.length > 15;

      if(nameBad) {
        socket.emit('nameBad', name);
        return;
      }

      var nameExist = _.some(self.users, function(user) {
        return user.name == name;
      });

      if (!nameExist) {
        var newUser = new User({name: name, socket: socket});
        self.users.push(newUser);
        self.broadcastToUsers('entered', name);
      } else {
        socket.emit('nameExist', name);
      }
    });
  }

  self.broadcastToUsers = function(event, msg) {
    _.map(self.users, function(user){
      user.socket.emit(event, msg);
    });
  }
}

var User = function(params) {
  var self = this;

  self.name = params.name;
  self.socket = params.socket;
}
