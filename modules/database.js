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
  delete_user : function(uid,callback){
    mongodb.connect(url, function(err,db){
      if(err) throw err;
      dbo = db.db('chatdb');
      dbo.collection("users").findOneAndDelete({id:uid}, function(err,res){
        if (err) {
              throw err;
            }
            if (!res) {
              callback(null, 404);
            }
           else callback(null, res.value.name);
      });
      db.close();
    });
  },
  update_list : function(callback){
    mongodb.connect(url, function(err,db){
      if (err) {
        throw err;
      }
      dbo = db.db('chatdb');
      dbo.collection("users").find({}).toArray(function(err,res){
        if (err) {
          throw err;
        }
        if (!res) {
          console.log(404);
        }
        else {
          res.forEach(function(element){
          console.log(element.name);
          });
        }
      });
      db.close();
    });
  }
}
