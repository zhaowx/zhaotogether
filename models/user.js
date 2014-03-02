var mongodb = require('mongodb').Db;
var settings = require('../settings');
var crypto =require('crypto');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
};
module.exports = User;

User.prototype.save = function save(callback) {
	var md5 = crypto.createHash('md5'),
    	email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
    	head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
	
  // 存入 Mongodb 的文檔
  var user = {
    name: this.name,
    password: this.password,
	email: this.email,
	head:head
  };
  mongodb.connect(settings.url,function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      // 爲 name 屬性添加索引
      collection.ensureIndex('name', {unique: true},function(err, user){
		 	db.close();
        	callback(err, user); 
		 });
      // 寫入 user 文檔
      collection.insert(user, {safe: true}, function(err, user) {
       db.close();
        callback(err, user);
      });
    });
  });
};

User.get = function get(username, callback) {
 mongodb.connect(settings.url,function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
       db.close();
        return callback(err);
      }
      // 查找 name 屬性爲 username 的文檔
      collection.findOne({name: username}, function(err, doc) {
       db.close();
        if (doc) {
          // 封裝文檔爲 User 對象
          var user = new User(doc);
          callback(err, user);
        } else {
          callback(err, null);
        }
      });
    });
  });
};
