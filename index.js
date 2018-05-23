#!/usr/bin/env node

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();
const database = require('./modules/database');

app.use('/scripts/izitoast', express.static(__dirname + '/node_modules/izitoast/dist/js'));
app.use('/styles/izitoast', express.static(__dirname + '/node_modules/izitoast/dist/css'));
app.use('/styles', express.static(__dirname + '/styles'));

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
  socket.on('new_user', function(user){
    database.add_user(socket.id,user);
    socket.broadcast.emit('new_user',user);
    console.log(user+' cevrimici oldu!\nid : '+socket.id+'\n');
    database.update_list(function(err){
      if (err) {
        throw err;
      }
    });
  });
  socket.on('disconnect', function(){
    database.delete_user(socket.id, function(err,res){
      if (err) {
        throw err;
      }
      console.log(res+' cevrimdisi oldu!');
      socket.broadcast.emit('user_gone',res);
    });
  });
  socket.on('new_message', function(msg){
    console.log(msg);
    io.emit('new_message',msg+","+socket.id);
  });
});

http.listen(3000, function(){
  console.log('Listening on *:3000');
});
