var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();
var mongodb = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";


app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
  socket.on('new_user', function(user){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("users").insertOne({id:socket.id,name:user}, function(err,res){
        if (err) {
          throw err;
        }
        db.close();
      });
    });
    socket.broadcast.emit('new_user',user);
    console.log(user+' cevrimici oldu!\nid : '+socket.id+'\n');
  });
  socket.on('disconnect', function(){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("users").findOne({id:socket.id}, function(err,res){
        if (err) {
          throw err;
        }
        console.log(res.name+' cevrimdisi oldu!');
        socket.broadcast.emit('user_gone',res.name);
        db.close();
      });
    });
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("users").deleteOne({id:socket.id});
      db.close();
    });
  });
  socket.on('new_message', function(msg){
    io.emit('new_message',msg);
  });
});

http.listen(3000,function(){
  console.log('Listening on *:3000');
});
