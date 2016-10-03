var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
//var topics = require('./routes/topics');
var iot = require('./routes/iot');
var chat = require('./routes/chat');
var rooms = require('./routes/rooms');
var sensor = require('./routes/sensor');
//var login = require('./routes/login');
var camera = require('./routes/camera');
var sign_in = require('./routes/sign-in');
var signup = require('./routes/signup');
var streaming = require('./routes/streaming');
var mapping = require('./routes/mapping');
var cookie = require('./routes/cookie');

var config = require('config.json')('./config/config.json');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = require('redis');

var app = express();

var mysql = require('mysql');
var conn = mysql.createConnection({
	host      : config.rds.host,
	user      : config.rds.user,
	password  : config.rds.password,
	database  : config.rds.ajouiotdb
});

conn.connect();


console.log("My webpage start!");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'jquery-mobile')));
app.use(express.static(path.join(__dirname, 'bootstrap-3.3.4-dist')));

app.use('/', routes);
// app.use('/users', users);
// app.use('/topics', topics);
app.use('/iot', iot);
app.use('/chat', chat);
app.use('/rooms', rooms);
app.use('/sensor', sensor);
//app.use('/login', login);
app.use('/sign-in', sign_in);
app.use('/signup', signup);
app.use('/camera', camera);
app.use('/streaming', streaming);
app.use('/mapping', mapping);
//app.use('/cookie', cookie);


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

app.use(passport.initialize());
app.use(passport.session());
//app.use(session({ secret: 'SECRET' }));
//var session = passport.session();


app.get('/writecookie', cookie.writecookie);
app.get('/readcookie', cookie.readcookie);




// passport.use(new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password'
// }, function( email, password, done){
//     User.findOne({
//         where: {
//             email: email
//         }
//     }).then(function( user ){
//         if(!user){
//             return done(null, false);
//         }
//         if(user.password !== password){
//             return done(null, false);
//         }
//         return done(null, user);
//     }).catch(function( err ){
//         done(err, null);
//     });
// }));



// app.use(session({
// 	  store: new RedisStore({
// 	    port: config.redis.port,
// 	    host: config.redis.host//,
// 	    //db: config.redis.db,
// 	    //pass: config.redis.password
// 	  }),
// 	  secret: 'Your secret here',
// 	  proxy: true,
// 		resave: true,
//     saveUninitialized: true,
// 	  cookie: { secure: true }
// 	}));

app.use(session({
	  store: new RedisStore({
	    port: config.redis.port,
	    host: config.redis.host,
	    db: config.redis.db,
	    pass: config.redis.password
	  }),
	  secret: 'ajouiot',
	  proxy: true,
		resave: true,
    saveUninitialized: true,
	  cookie: { secure: true }
	}));

// app.use(function (req, res, next) {
// 	  if (!req.session) {
// 	    return next(new Error('oh no')); // handle error
//   	}
// 	  next(); // otherwise continue
// });


// app.use(session({
//     secret: 'keyboard cat',
//     proxy: true,
//     resave: true,
//     saveUninitialized: true,
//     cookie: { secure: true }
// }));



// serialize
// 인증후 사용자 정보를 세션에 저장
passport.serializeUser(function(user, done) {
    console.log('serialize');
    done(null, user);
});


// deserialize
// 인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
passport.deserializeUser(function(user, done) {
    //findById(id, function (err, user) {
    console.log('deserialize');
    done(null, user);
    //});
});

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/login');
}

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login_fail', failureFlash: true }),
    function(req, res) {
				console.log(req.session);
        res.redirect('/login_success');
});

app.get('/login', function(req, res, next) {

			//console.log('chat _ ROOMID : ' + global.ROOMID);
			res.render('login', { title: 'Ajou IoT', message : 'message'});

});

app.get('/login_success', function(req, res, next) {
			console.log('Login Success : ' + req.user);
			console.log(req.session);
			//console.log('Session : ' + req.session);
			//console.log(Object.keys(req));
			console.log(req._passport.session);
			try{
			if(req.session.passport.user.id == 110154195936516884946){
				res.redirect('/rooms/' + req.session.passport.user.id);
			}else if(req.session.passport.user.id == 'asdf' && req.session.passport.user.password == 'asdf'){
				res.redirect('/rooms/' + req.session.passport.user.id);
			}else{
				res.send('Login Success!');
			}
		}catch(exception){
			console.log(exception);
		}
});

function loginSuccess(id){
		var url = '/rooms/';

		if(id == 110154195936516884946 || (id == 'asdf' && password == 'asdf')){
			url += id;
		}else{

		}

		return url;
}

app.get('/login_fail', function(req, res, next) {
		res.send('Login Fail');
});

passport.use(new LocalStrategy({
        usernameField : 'id',
        passwordField : 'password',
        passReqToCallback : true
    }
    ,function(req, id, password, done) {
				console.log('LocalStrategy');

        //if(id=='asdf' && password=='asdf'){
            var user = { 'id':id,
                          'password':password};
            return done(null,user);
        //}else{
        //    return done(null,false);
        //}
    }
	));

app.post('/local-login', passport.authenticate('local'), function(req, res){
		console.log('local-login');
		if (req.isAuthenticated()) {
				console.log(req.session);
				//res.redirect('/login_success');
				try{
					if(req.session.passport.user.id == 110154195936516884946){
						res.redirect('/rooms/' + req.session.passport.user.id);
					}else if(req.session.passport.user.id == 'asdf' && req.session.passport.user.password == 'asdf'){
						res.redirect('/rooms/' + req.session.passport.user.id);
					}else{
						res.send('Login Success!');
					}
				}catch(exception){
					console.log(exception);
				}
		}else{
			res.redirect('/login_fail');
		}
});

app.get('/userinfo', function(req, res, next){

    var isLogin = req.isAuthenticated();
    console.log( isLogin );

		console.log(req.user);
		res.send(req.user);
		//var userid = req.user.userid;
    //console.log('User id is '+ userid);

    //var email = req.user.email;
    //console.log('User Email is '+ email);
});

passport.use(new GoogleStrategy({
    clientID: '1067670564214-2e217fhtiisjhlqtll5hhi4gmksioi20.apps.googleusercontent.com',
    clientSecret: 'UPA0_oWAmXgDTbtkW8X1--X6',
    callbackURL: 'https://www.korchid.com/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
		console.log('GoogleStrategy');
		console.log(profile);
		return cb(null, profile);
    // profile.findOrCreate({ googleId: profile.id }, function (err, user) {
		// 	if (!user) {
    //       // make a new google profile without key start with $
		// 			console.log(user);
    //       var new_profile = {}
    //       new_profile.id = profile.id
    //       new_profile.displayName = profile.displayName
    //       new_profile.emails = profile.emails
    //       user = new User({
    //           name: profile.displayName
    //         , email: profile.emails[0].value
    //         , username: profile.username
    //         , provider: 'google'
    //         , google: new_profile._json
    //       })
    //       user.save(function (err) {
    //         if (err) console.log(err)
    //         return done(err, user)
    //       })
    //     } else {
    //       return done(err, user)
    //     }
		// 	console.log(user);
    //   return cb(err, user);
    // });
  }
));


app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback',
  passport.authenticate('google'),
  function(req, res) {
    // Successful authentication, redirect home
		if (req.isAuthenticated()) {
				console.log(req.user);
				//res.redirect('/login_success');
				res.redirect('/rooms/' + req.session.passport.user.id);
		}else{
			res.redirect('/login_fail');
		}
    //res.redirect('/');
		//res.send(req.user);
  });


	passport.use(new FacebookStrategy({
	    clientID: '1744185272461961',
	    clientSecret: 'e70790dbdf575043408e1d12a3571f34',
	    callbackURL: "https://www.korchid.com/auth/facebook/callback"
	  },
	  function(accessToken, refreshToken, profile, cb) {
			console.log('FacebookStrategy');
			console.log(profile);
			return cb(null, profile);
	    // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
			// 	console.log(user);
	    //   return cb(err, user);
	    // });
	  }
	));


	app.get('/auth/facebook',
	  passport.authenticate('facebook'));

	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', { failureRedirect: '/login' }),  function(req, res) {
	    // Successful authentication, redirect home.
			if (req.isAuthenticated()) {
					console.log(req.user);
					//res.redirect('/login_success');
					res.redirect('/rooms/' + req.session.passport.user.id);
			}else{
				res.redirect('/login_fail');
			}
	  });

		passport.use(new TwitterStrategy({
		    consumerKey: 'S8QClFieKug2cJhhZHBs0DmMt',
		    consumerSecret: 'K1ELWK3pUe0WjNKzchYl4u00J3aqHmRwxwyqnxaMCgC7mPdzJw',
		    callbackURL: "https://www.korchid.com/auth/twitter/callback"
		  },
		  function(token, tokenSecret, profile, done) {
				console.log('TwitterStrategy');
				console.log(profile);
				return done(null, profile);
				// User.findOrCreate({ twitterId: profile.id }, function(err, user) {
		    //   if (err) { return done(err); }
		    //   done(null, user);
		    // });
		  }
		));

		// Redirect the user to Twitter for authentication.  When complete, Twitter
		// will redirect the user back to the application at
		//   /auth/twitter/callback
		app.get('/auth/twitter', passport.authenticate('twitter'));

		// Twitter will redirect the user to this URL after approval.  Finish the
		// authentication process by attempting to obtain an access token.  If
		// access was granted, the user will be logged in.  Otherwise,
		// authentication has failed.
		app.get('/auth/twitter/callback',
		  passport.authenticate('twitter', { failureRedirect: '/login' }),	function(req, res) {
			// Successful authentication, redirect home.
			if (req.isAuthenticated()) {
					console.log(req.user);
					//res.redirect('/login_success');
					res.redirect('/rooms/' + req.session.passport.user.id);
			}else{
				res.redirect('/login_fail');
			}
		});

app.get('/logout', function(req, res){
	try{
	console.log('Function - logout');
	console.log(req.session);
	req.logout();
	req.session.destroy();
	console.log('logout!');
	console.log(req.session);
}catch(exception){
	console.log(exception);
}
	res.clearCookie();
	res.redirect('/login');
});





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
