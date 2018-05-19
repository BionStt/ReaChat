var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var new_user;

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
  socket.on('online_user', function(user){
    new_user = user;
    socket.broadcast.emit('online_user',user);
  });
  console.log(new_user+' online oldu!');
  socket.on('disconnect', function(){
    console.log('1 kisi offline oldu!');
  });
  socket.on('new_message', function(msg){
    io.emit('new_message',msg);
  });
});

http.listen(3000,function(){
  console.log('Listening on *:3000');
});
