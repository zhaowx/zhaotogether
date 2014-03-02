
/*
 * GET home page.
 */

/*exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.hello = function(req, res){
	//console.log(req);
	res.send(req.params.h);
	res.send('the time is ' + new Date().toString());
};
*/
var crypto = require('crypto');

var User = require('../models/user.js'),
Post = require('../models/post.js'),
fs = require('fs'),
Comment = require('../models/comment.js');

module.exports = function(app){
	
	
	app.get('/', function(req,res){
		var page = req.query.p ? parseInt(req.query.p) : 1;
		User.get(req.session.user,function(err,user){
			Post.get(null,page,function(err,posts,total){
				if(err){
					posts=[]
				}
				res.render('index',{
					title:'首页',
					user: req.session.user,
					posts:posts,
					page:page,
					head:'http://en.gravatar.com/userimage/57663076/e5ed929dcb4ab9e0c56ca147c7d3c85c.jpeg',
					isFirstPage: (page-1)==0,
					isLastPage:((page-1)*5+posts.length)==total,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			})
		})
	});
	
	app.get('/tasks', function (req, res) {
	  	res.render('tasks',{
	  		title:'tasks',
	  		user:req.session.user,
	  		success: req.flash('success').toString(),
			error: req.flash('error').toString()
	  	})
	});
	
	app.get('/dutys', function (req, res) {
	  	res.render('dutys',{
	  		title:'dutys',
	  		user:req.session.user,
	  		success: req.flash('success').toString(),
			
			error: req.flash('error').toString()
	  	})
	});
	
	app.get('/friends', function (req, res) {
	  	res.render('friends',{
	  		title:'friends',
	  		user:req.session.user,
	  		success: req.flash('success').toString(),
			error: req.flash('error').toString()
	  	})
	});
	
	app.get('/settings', function (req, res) {
	  	res.render('settings',{
	  		title:'settings',
	  		user:req.session.user,
	  		success: req.flash('success').toString(),
			error: req.flash('error').toString()
	  	})
	});
	
	app.get('/newtask', function (req, res) {
	  	res.render('new_task',{
	  		title:'newtask',
	  		user:req.session.user,
	  		success: req.flash('success').toString(),
			error: req.flash('error').toString()
	  	})
	});

	//app.get('/u/:user', checkLogin);
	app.get('/u/:user',function(req,res){
		var page = req.query.p ? parseInt(req.query.p) : 1;
		User.get(req.params.user, function(err,user){
			if(!user){
				req.flash('error','用户不存在');
				return res.redirect('/');
			}
			Post.get(user.name, page, function(err,posts,total){
				if(err){
					req.flash('error',err);
					return res.redirect('/');
				}
				res.render('user',{
					title:'发布文章',
					user:req.session.user,
					head:'http://en.gravatar.com/userimage/57663076/e5ed929dcb4ab9e0c56ca147c7d3c85c.jpeg',
					posts:posts,
					page:page,
					isFirstPage: (page-1)==0,
					isLastPage:((page-1)*5+posts.length)==total,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			})
		})
	});
	
	app.get('/u/:user/:day/:title',function(req,res){
		Post.getOne(req.params.user,req.params.day,req.params.title,function(err,post){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('article',{
				title:req.params.title,
				post:post,
				user:req.session.user,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
			})
		})
	})
	
	app.post('/u/:name/:day/:title', function (req, res) {
	  var date = new Date(),
		  time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
				 date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
	  var md5 = crypto.createHash('md5'),
		email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
		head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
		console.log('head'+head);
	  var comment = {
		  name: req.body.name,
		  head:head,
		  email: req.body.email,
		  website: req.body.website,
		  time: time,
		  content: req.body.content
	  };
	  var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
	  newComment.save(function (err) {
		if (err) {
		  req.flash('error', err); 
		  return res.redirect('back');
		}
		req.flash('success', '留言成功!');
		res.redirect('back');
	  });
	});
	
	app.get('/archive', function (req, res) {
	  Post.getArchive(function (err, posts) {
		if (err) {
		  req.flash('error', err); 
		  return res.redirect('/');
		}
		res.render('archive', {
		  title: '存档',
		  posts: posts,
		  user: req.session.user,
		  success: req.flash('success').toString(),
		  error: req.flash('error').toString()
		});
	  });
	});
	
	app.get('/tags', function (req, res) {
	  Post.getTags(function (err, posts) {
		if (err) {
		  req.flash('error', err); 
		  return res.redirect('/');
		}
		res.render('tags', {
		  title: '标签',
		  posts: posts,
		  user: req.session.user,
		  success: req.flash('success').toString(),
		  error: req.flash('error').toString()
		});
	  });
	});
	
	app.get('/tags/:tag', function (req, res) {
	  Post.getTag(req.params.tag, function (err, posts) {
		if (err) {
		  req.flash('error',err); 
		  return res.redirect('/');
		}
		res.render('tag', {
		  title: 'TAG:' + req.params.tag,
		  posts: posts,
		  user: req.session.user,
		  success: req.flash('success').toString(),
		  error: req.flash('error').toString()
		});
	  });
	});


	//编辑文章
	app.get('/edit/:user/:day/:title', checkLogin);
	app.get('/edit/:user/:day/:title',function(req,res){
		Post.getOne(req.params.user,req.params.day,req.params.title,function(err,post){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('article_edit',{
				title:'编辑:'+req.params.title,
				post:post,
				user:req.session.user,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
			})
		})
	})
	
	app.post('/edit/:user/:day/:title', checkLogin);
	app.post('/edit/:user/:day/:title',function(req,res){
		Post.update(req.params.user,req.params.day,req.params.title, req.body.content,function(err){
			var url = '/u/' + req.params.user + '/' + req.params.day + '/' + req.params.title;
			if (err) {
			  req.flash('error', err); 
			  return res.redirect(url);//出错！返回文章页
			}
			req.flash('success', '修改成功!');
			res.redirect(url);//成功！返回文章页
		})
	})
	
	app.get('/remove/:user/:day/:title',checkLogin);
	app.get('/remove/:user/:day/:title',function(req,res){
		Post.remove(req.params.user,req.params.day,req.params.title,function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','remove success');
			res.redirect('/');
		})
	})
	
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req,res){
		res.render('reg',{
			title:'用户注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()});
	});
	
	app.post('/reg', checkNotLogin);
	app.post('/reg',function(req,res){
		if(req.body.username==''){
			req.flash('error','用户名不能为空');
			return res.redirect('/reg');
		}
		if(req.body.password==''){
			req.flash('error','密码不能为空');
			return res.redirect('/reg');
		}
		if(req.body['password-repeat']!=req.body['password']){
			req.flash('error','两次输入的口令不一致');
			return res.redirect('/reg');
		}
		
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		var email = req.body.email;
		
		var newUser = new User({
			name:req.body.username,
			password: password,
			email: email
		})
		
		User.get(newUser.name,function(err,user){
			if(user)
				err = '用户已存在';
			if(err){
				req.flash('error',err);
				return res.redirect('/reg');
			}
			
			newUser.save(function(err){
				if(err){
					req.flash('error',err);
					return res.redirect('/reg');
				}
				req.session.user = newUser;
				req.flash('success','注册成功');
				res.redirect('/');
			})
		})
		
	});
		
		app.get('/login', checkNotLogin);
		app.get('/login',function(req,res){
			res.render('login',{
				title:'用户登入',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			})
		})
	
		//登陆的响应
		app.post('/login', checkNotLogin);
		app.post('/login', function(req, res){
	  	//生成密码的散列值
			var md5 = crypto.createHash('md5'),
			  password = md5.update(req.body.password).digest('base64');
			//检查用户是否存在
			User.get(req.body.username, function(err, user){
				if(!user){
				  req.flash('error', '用户不存在!'); 
				  return res.redirect('/login'); 
				}
				//检查密码是否一致
				if(user.password != password){
				  req.flash('error', '密码错误!'); 
				  return res.redirect('/login');
				}
				//用户名密码都匹配后，将用户信息存入 session
				req.session.user = user;
				req.flash('success','登陆成功!');
				res.redirect('/');
			  });
		});
	
		//upload
		app.get('/upload',checkLogin);
		app.get('/upload',function(req,res){
			res.render('upload',{
				title:'upload',
				user:req.session.user,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
			})
		});
		app.post('/upload',checkLogin);
		app.post('/upload',function(req,res){
			 for (var i in req.files) {
				if (req.files[i].size == 0){
				  // 使用同步方式删除一个文件
				  fs.unlinkSync(req.files[i].path);
				  console.log('Successfully removed an empty file!');
				} else {
				  var target_path = './public/images/' + req.files[i].name;
				  // 使用同步方式重命名一个文件
				  fs.renameSync(req.files[i].path, target_path);
				  console.log('Successfully renamed a file!');
				}
			  }
			
			req.flash('success','upload success');
			res.redirect('/upload');
		});
	
		//登出响应
		app.get('/logout', checkLogin);
		app.get('/logout', function(req, res){
		  req.session.user = null;
		  req.flash('success','登出成功!');
		  res.redirect('/');
		});

		//music登出响应
		//app.get('/music', checkLogin);
		app.get('/music', function(req, res){
		  console.log('music')
		  req.flash('success','为您私人定制的music马上就来！!');

		 	res.render('music',{
				title:'upload',
				user:req.session.user,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
			})
		});
		
		
		app.get('/post', checkLogin);
		app.get('/post', function(req, res){
			  Post.get(req.session.user.name, function(err,posts){
			  if(err){
				  req.flash('error',err);
				  return res.redirect('/');
			  }

				res.render('posts',{
					title:'发表',
					user:req.session.user,
					head:'http://en.gravatar.com/userimage/57663076/e5ed929dcb4ab9e0c56ca147c7d3c85c.jpeg',
					success:req.flash('success').toString(),
					error:req.flash('error').toString(),
					posts:posts
				}); 
			})
		});
		app.post('/post', checkLogin);
		app.post('/post', function(req, res){
			 var currentUser = req.session.user,
			 	tags = [{"tag":req.body.tag1},{"tag":req.body.tag2},{"tag":req.body.tag3}],
				post = new Post(currentUser.name, currentUser.head,  req.body.post,'', req.body.content, tags);
				console.log(req.body.content);
				post.save(function(err){
					if(err){
						req.flash('error', err); 
						return res.redirect('/');
					}
					req.session.posts = post;
					req.flash('success', '发布成功!');
					res.redirect('/');
				 });
		});
		
		app.use(function (req, res) {
		  res.render("404");
		});
		
		function checkLogin(req, res, next){
			if(!req.session.user){
				req.flash('error','未登录'); 
				return res.redirect('/login');
			}
			next();
		}


		function checkNotLogin(req,res,next){
			if(req.session.user){
				req.flash('error','已登录'); 
				return res.redirect('/');
			}
			next();
		}

	
};