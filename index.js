var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];


app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
  socket.on('new_user', function(user){
    users[socket.id] = {id : socket.id, name : user};
    socket.broadcast.emit('new_user',user,users);
    console.log(user+' cevrimici oldu!\nid : '+socket.id+'\n');
  });
  socket.on('disconnect', function(){
    console.log(users[socket.id].name+' cevrimdisi oldu!');
    socket.broadcast.emit('user_gone',users[socket.id].name,users);
    delete users[socket.id];
  });
  socket.on('new_message', function(msg){
    io.emit('new_message',msg);
  });
});

http.listen(8000,function(){
  console.log('Listening on *:8000');
});
