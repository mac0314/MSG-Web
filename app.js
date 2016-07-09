
var express = require('express');
var app = express();
var path = require('path');

var favicon = require('serve-favicon');
//global.jQuery = require('jQuery');
//var bootstrap_jQuery=('bootstrap-jquery');
//var bootstrap = require('bootstrap');
//var node_jsdom = require('node-jsdom');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'image')));


var cheerio = require('cheerio');
//var request = require('request');

var config = require('config.json')('./config/config.json');

console.log("Webpage start!");

var fs = require('fs');

var mysql = require('mysql');
var conn = mysql.createConnection({
	host      : config.rds.host,
	user      : config.rds.user,
	password  : config.rds.password,
	database  : config.rds.webdatabase
});

conn.connect();

var pug = require('pug');

//app.set('view engine', 'jade')
//app.set('views', path.join(__dirname, '/views'));


//var url = 'http://www.tistory.com';
//request(url, function(error, response, html){
//	if (error) {throw error};

	//console.log (html);

//	var $ = cheerio.load(html);

//	var arr = $('.tistory_recomm').children('.recomm_blog').children('.tit_subject');
  	//for(var i=0;i<arr.prevObject.length;i++){
  	//	res.send(arr.prevObject[i].children[0].next.children[3].children[0].data);
	//}
//});


app.use('/image', './image');

app.locals.pretty = true;

app.set('view engine', 'html');
//app.set('views', './views_mysql');
//app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));



var server = app.listen(config.app.port, function(){
	console.log('Express server has started on port ' + config.app.port + ' !');

	if( process.env.NODE_ENV == 'production' ) {
    		console.log("Production Mode");
  	} else if( process.env.NODE_ENV == 'development' ) {
    		console.log("Development Mode");
  	}
});

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));




app.get('/', function(req, res){

	var myName = config.rds.user;
	//res.render('index', { title: 'Korchid' , name:'uiandwe'});
	var sql = 'SELECT id, title FROM topic WHERE author = (SELECT id FROM user WHERE name ="' + myName + '")';

	conn.query(sql, function(err, rows, fields){
		if(err){
			console.log(err);
		}else{
			if(!rows.length){
				console.log("Missing DB data.");
			}else{
				res.sendFile(path.join(__dirname + '/views/topic.html'));
			}
		}
  });

	//pug.render('index');
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get(['/topic', '/topic/:id'],function(req, res){
  var sql = 'SELECT id, title FROM topic';

  conn.query(sql, function(err, topics, fields){

  });
});



//conn.end();
