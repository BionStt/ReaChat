#!/usr/bin/env node

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();
const database = require('./modules/database');
var new_uc;
var dlt_uc;
var new_msg;

app.use('/scripts/izitoast', express.static(__dirname + '/node_modules/izitoast/dist/js'));
app.use('/styles/izitoast', express.static(__dirname + '/node_modules/izitoast/dist/css'));
app.use('/styles', express.static(__dirname + '/styles'));

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
  socket.on('new_user', function(user){
    new_uc = user.split(",");
    socket.join(new_uc[1]);
    database.add_user(socket.id,new_uc[0],new_uc[1]);
    socket.in(new_uc[1]).emit('new_user',user);
    console.log(new_uc[0]+' '+new_uc[1]+' adli kanalda cevrimici oldu!\nid : '+socket.id+'\n');
  });
  socket.on('disconnect', function(){
    database.delete_user(socket.id, function(err,res){
      if (err) {
        throw err;
      }
      if (res==404) {
        console.log("isimsiz çıkış yapıldı!");
      }
      else{
        dlt_uc = res.split(",");
        console.log(dlt_uc[0]+' cevrimdisi oldu!');
        io.in(dlt_uc[1]).emit('user_gone',dlt_uc[0]);
      }
    });
  });
  socket.on('new_message', function(msg){
    new_msg = msg.split("<^>");
    console.log(msg);
    io.in(new_msg[1]).emit('new_message',new_msg[0]+","+socket.id);
  });
});

http.listen(3000, function(){
  console.log('Listening on *:3000');
});
