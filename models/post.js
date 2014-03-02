var mongodb = require('mongodb').Db,
markdown = require('markdown').markdown;
var settings = require('../settings');

var pageLimit = 5; //每页显示的日志数

var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth()+1),
      day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
  }

function Post(username, head, post, time, content, tags) {
  this.user = username;
  this.head = head;
  this.post = post;
  this.time = time;
  this.content = content;
  this.tags = tags;

};
module.exports = Post;

Post.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var post = {
    user: this.user,
	head: this.head,
    post: this.post,
    time: time,
	content: this.content,
	tags: this.tags,
	comments:[],
	pv:0
  };
  mongodb.connect(settings.url,function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
       db.close();
        return callback(err);
      }
      // 爲 user 屬性添加索引
      collection.ensureIndex('user',function(err, post){
		 	db.close();
        	callback(err, post); 
		 });
      // 寫入 post 文檔
      collection.insert(post, {safe: true}, function(err, post) {
       db.close();
        callback(err, post);
      });
    });
  });
};

Post.get = function get(username, page, callback) {
  mongodb.connect(settings.url,function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
       db.close();
        return callback(err);
      }
      // 查找 user 屬性爲 username 的文檔，如果 username 是 null 則匹配全部
      var query = {};
      if (username) {
        query.user = username;
      }
      //collection.find(query).sort({time: -1}).toArray(function(err, docs) {
		collection.count(query,function(err,total){
		
			collection.find(query,{
				skip:(page-1)*pageLimit,
				limit:pageLimit
			}).sort({
				time:-1
			}).toArray(function(err,docs){
			 db.close();
			if (err) {
			  callback(err, null);
			}
			// 封裝 posts 爲 Post 對象
			var posts = [];
			docs.forEach(function(doc, index) {
			  var post = new Post(doc.user, doc.post, doc.time);
			  posts.push(post);
			});
			callback(null, docs,total);
			})
		})
       
      });
    });
};

Post.getOne = function(name,day,title,callback){
	mongodb.connect(settings.url,function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				db.close();
				return callback(err);
			}
			//根据用户名、发表日期及文章名进行查询
			collection.findOne({"user":name,
			"time.day":day,
			"post":title
			},function(err,doc){		
				if(err){
					db.close();
					callback(err);
				}
				if(doc){
					//每访问 1 次，pv 值增加 1
					  collection.update({
						"user": name,
						"time.day": day,
						"post": title
					  }, {
						$inc:{pv:1}
					  }, function (err) {
						if (err) {
							console.log(err);
						  return callback(err);
						}
					  });
					//解析 markdown 为 html
        			//doc.post = markdown.toHTML(doc.post);
					//console.log(doc.comments)
					if(doc.comments){
						doc.comments.forEach(function(comment){
							comment.content = markdown.toHTML(comment.content);
						})
					}
				}
				db.close();
       			callback(null, doc);//返回查询的一篇文章
			})
		})
	})
}

//返回所有文章存档信息
Post.getArchive = function(callback) {
  //打开数据库
  mongodb.connect(settings.url,function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
       db.close();
        return callback(err);
      }
      //返回只包含 name、time、title 属性的文档组成的存档数组
      collection.find({}, {
        "user": 1,
        "time": 1,
        "post": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
       db.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

Post.update = function(name,day,title,post,callback){
	mongodb.connect(settings.url,function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				db.close();
				return callback(err);
			}
			//根据用户名、发表日期及文章名进行查询
			collection.update({
			"user":name,
			"time.day":day,
			"post":title
			},{
				$set:{content:post}
			},function(err,doc){
				db.close();
				if(err){
					callback(err);
				}
       			callback(null);
			})
		})
	})
}

Post.remove = function(name,day,title,callback){
	mongodb.connect(settings.url,function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				db.close();
				return callback(err);
			}
			//根据用户名、发表日期及文章名进行查询
			console.log(name+'  '+day+'  '+title);
			collection.remove({
			"user":name,
			"time.day":day,
			"post":title
			},function(err,doc){
				db.close();
				if(err){
					callback(err);
				}
       			callback(null);
			})
		})
	})
}

//返回所有标签
Post.getTags = function(callback) {
  //打开数据库
  mongodb.connect(settings.url,function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
       db.close();
        return callback(err);
      }
      //distinct 用来找出给定键的所有不同值
      collection.distinct("tags.tag", function (err, docs) {
       db.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {
  mongodb.connect(settings.url,function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      //通过 tags.tag 查询并返回只含有 name、time、title 键的文档组成的数组
      collection.find({
        "tags.tag": tag
      }, {
        "user": 1,
        "time": 1,
        "post": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        db.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {
  mongodb.connect(settings.url,function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
       db.close();
        return callback(err);
      }
      var pattern = new RegExp("^.*" + keyword + ".*$", "i");
      collection.find({
        "post": pattern
      }, {
        "user": 1,
        "time": 1,
        "post": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        db.close();
        if (err) {
         return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};
