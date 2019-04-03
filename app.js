var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server);
usernames = [];   // array of usernames

server.listen(process.env.PORT || 3000);     // process.env.PORT is been used for heroku to and 3000 is used to run locally

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
// basically work on events
// Socket functionality on server side
io.sockets.on('connection', function(socket){
    socket.on('new user', function(data, callback){
        if(usernames.indexOf(data) != -1){   // checking if the same user is not logged in again, to get the username by indexOf()
          callback(false);
        } else{
          callback(true);
          socket.username = data;
          usernames.push(socket.username);  // adding that username to the array if it is a new user
          updateUsernames();
        }
    });

    //Update Usernames
    function updateUsernames(){
      io.sockets.emit('usernames', usernames);
    }

    // Send Message Event
    socket.on('send message', function(data){
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    //Disconnect(server side code)
    //Event if the user diconnects from the server or the socket
    socket.on('disconnect', function(data){
        if(!socket.username) return;
        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsernames();
    });
});
