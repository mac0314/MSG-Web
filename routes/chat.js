var express = require('express');
var router = express.Router();
var config = require('config.json')('./config/config.json');

var util = require('util');

var mqtt = require('mqtt');

var mysql = require('mysql');
var conn = mysql.createConnection({
	host      : config.rds.host,
	user      : config.rds.user,
	password  : config.rds.password,
	database  : config.rds.iotdatabase
});

var request = require('request');

conn.connect();

var sh_timer = require('./timer');

/* GET home page. */
router.get(['/', '/:id'], function(req, res, next) {
	var topicId = req.params.id;
	global.ROOMID = req.params.id;
  var myName = config.rds.user;
	var topicSeq = null;
	var mqtt_client = config.iot.mqttproxy;

	var message = topicId;


	//console.log('chat _ ROOMID : ' + global.ROOMID);
	res.render('chat', { title: 'Ajou IoT', id:global.ROOMID , message : message});

});

module.exports = router;