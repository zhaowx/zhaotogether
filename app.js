
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var expressLayouts = require('express-ejs-layouts');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

var app = express();

var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

// all environments
app.set('port', process.env.APP_PORT || 18080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.logger({stream: accessLog}));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images' }));
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.session({
	secret: settings.cookieSecret,
	url: settings.url,
  	cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
	store: new MongoStore({
		url: settings.url
	})
}))

app.use(expressLayouts);
app.use(app.router);

//app.use(express.router(routes));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(function(req,res,next){

   //    res.locals.user=req.session.user;
	  // var err = req.flash('error');
   //    res.locals.error=err.length?err:null;
	  // var suc = req.flash('success');
   //    res.locals.success=suc.length?suc:null;
   //      next();
});

routes(app);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
