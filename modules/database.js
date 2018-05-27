var mongodb = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
var dbo;

module.exports = {
  add_user : function(uid,username){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("users").insertOne({id:uid,name:username}, function(err,res){
        if (err) {
          throw err;
        }
        console.log(username+" eklendi");
        db.close();
      });
    });
  },
  join_channel : function(uid, ch){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("users").update({id:uid},{$set : { channel:ch} }, function(err,res){
        if (err) {
          throw err;
        }
        db.close();
      });
    });
  },
  add_channel : function(channel){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("channels").insertOne({channel_name: channel}, function(err,res){
        if (err) {
          throw err;
        }
        db.close();
      });
    });
  },
  get_channel_list : function(callback){
    mongodb.connect(url, function(err,db){
      if (err) {
        throw err;
      }
      dbo = db.db('chatdb');
      dbo.collection("channels").find({}).toArray(function(err,res){
        if (err) {
          throw err;
        }
        if (!res) {
          console.log(404);
        }
        else {
          callback(null,res);
        }
      });
      db.close();
    });
  },
  delete_user : function(uid,callback){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("users").findOneAndDelete({id:uid}, function(err,res){
        if (err) {
              console.log("isimsiz çıkış yapıldı!");
        }
        if (!res.value) {
              callback(null, 404);
            }
           else {
             callback(null,{username: res.value.name, channel: res.value.channel});
           }
      });
      db.close();
    });
  },
  add_message : function(msg, senderid, sendername, chnnel){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("messages").insertOne({message: msg, sender_id: senderid, sender_name: sendername, channel: chnnel}, function(err,res){
        if (err) {
          throw err;
        }
        db.close();
      });
    });
  },
  get_messages : function(chnnel, callback){
    mongodb.connect(url, function(err,db){
      if (err) {
        throw err;
      }
      dbo = db.db('chatdb');
      dbo.collection("messages").find({channel: chnnel}).toArray(function(err,res){
        if (err) {
          throw err;
        }
        if (!res) {
          callback(null,null);
        }
        else {
          callback(null,res);
        }
      });
      db.close();
    });
  }
  // update_list : function(callback){
  //   mongodb.connect(url, function(err,db){
  //     if (err) {
  //       throw err;
  //     }
  //     dbo = db.db('chatdb');
  //     dbo.collection("users").find({}).toArray(function(err,res){
  //       if (err) {
  //         throw err;
  //       }
  //       if (!res) {
  //         console.log(404);
  //       }
  //       else {
  //         res.forEach(function(element){
  //           console.log(element.name);
  //         });
  //       }
  //     });
  //     db.close();
  //   });
  // }
}
