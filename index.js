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
app.use('/src',express.static(__dirname + '/src'));

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});


io.on('connection', function(socket){
  socket.on('disconnection_request', function(){
    socket.disconnect();
  });
  socket.on('edit-together',function(data){
    console.log(data);
    io.emit('edit-together', 'connected');
  });
  socket.on('switch_channel', function(data){
    socket.leave(data.current_channel);
    io.in(data.current_channel).emit('user_gone',data.username);
    database.join_channel(socket.id, data.new_channel);
    socket.join(data.new_channel);
    socket.in(data.new_channel).emit('new_user',data.username);
    console.log(data.username+' '+'adlı kişi, '+data.new_channel+' kanalına geçiş yaptı.');
    database.get_messages(data.new_channel, function(err, res){
      if (err) {
        throw err;
      }
      else{
        res.forEach(function(data){
          socket.emit('new_message',{message: data.message, sender_id: data.sender_id, sender_name: data.sender_name});
        });
      }
    });
    socket.emit('clear_list');
    database.get_channel_list(function(err,res){
      if (err) {
        throw err;
      }
      else {
        res.forEach(function(channel){
          if (String(channel.channel_name) != "main_gate") {
            socket.emit('update_channel_list', channel.channel_name);
          }
        });
      }
    });
  });
  socket.on('new_channel',function(data){
    database.add_channel(data.channel, socket.id);
    io.emit('clear_list');
    database.get_channel_list(function(err,res){
      if (err) {
        throw err;
      }
      else {
        res.forEach(function(channel){
            io.emit('update_channel_list', channel.channel_name, channel.created_by);
        });
      }
    });
  });
  socket.on('switch_channel_req',function(data){
    socket.broadcast.to(data.createdby).emit('switch_channel_req',{username: data.username, current_channel: data.new_channel, socket_id: socket.id});
  });
  socket.on('switch_channel_res',function(data){
    socket.broadcast.to(data.socket_id).emit('switch_channel_res',{response: data.response, username: data.username,channel_name: data.channel_name});
  });
  socket.on('delete_channel',function(data){
    socket.in(data.channel_name).emit('delete_channel',{channel_name: data.channel_name, user: data.username});
    database.delete_channel(data.channel_name);
    database.delete_messages(data.channel_name);
    io.emit('clear_list');
    database.get_channel_list(function(err,res){
      if (err) {
        throw err;
      }
      else {
        res.forEach(function(channel){
            io.emit('update_channel_list', channel.channel_name, channel.created_by);
        });
      }
    });
  });
  socket.on('private_conv_resp',function(res){
    socket.broadcast.to(res.reciever_id).emit('private_conv_resp', {response: res.response, sender_name: res.sender_name});
  });
  socket.on('private_conv', function(data){
    console.log(data.sender_name+"=>"+data.reciever_name);
    socket.broadcast.to(data.reciever_id).emit('private_conv',{sender_name: data.sender_name, sender_id: socket.id});
  });
  socket.on('new_user', function(data){
    database.add_user(socket.id,data.new_user,data.channel);
    database.join_channel(socket.id,data.channel);
    socket.join(data.channel);
    socket.in(data.channel).emit('new_user',data.new_user);
    console.log(data.new_user+' '+data.channel+' adli kanalda cevrimici oldu!\nid : '+socket.id+'\n');
    database.get_channel_list(function(err,res){
      if (err) {
        throw err;
      }
      else {
        res.forEach(function(channel){
          socket.emit('update_channel_list', channel.channel_name);
        });
      }
    });
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
        console.log(res.username+' cevrimdisi oldu!');
        io.in(res.channel).emit('user_gone',res.username);
      }
    });
  });
  socket.on('new_message', function(data){
    console.log(data);
    database.add_message(data.message, socket.id, data.sender_name, data.channel);
    io.in(data.channel).emit('new_message',{message: data.message, sender_id: socket.id, sender_name: data.sender_name});
  });
});

http.listen(3000, function(){
  console.log('Listening on *:3000');
});
