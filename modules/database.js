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
        db.close();
      });
    });
  },
  find_user : function(uid,callback){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("users").findOne({id:uid}, function(err,res){
        if (err) {
          throw err;
        }
        callback(null,res.name);
        db.close();
      });
    });
  },
  delete_user : function(uid){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("users").deleteOne({id:uid});
      db.close();
    });
  },
  update_list : function(){
    mongodb.connect(url, function(err,db){
      if (err) {
        throw err;
      }
      dbo = db.db('chatdb');
      dbo.collection("users").findOne({},function(err,res){
        if (err) {
          throw err;
        }
        return res;
      });
    });
    db.close();
  }
}
