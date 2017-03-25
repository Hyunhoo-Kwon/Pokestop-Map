var express = require('express');
var connection = require('../db');
var router = express.Router();

/* GET showdata listing. */
router.get('/portals-data', function(req, res, next) {
  	// DB query
	connection.query('SELECT * FROM portals', function (error, results) {
		if(error) {
			console.log('query error');
		}
		else {
			res.send(results);
			console.log('query success');
		}
	});
});

router.get('/portals-data/bounds', function(req, res, next) {
  	// DB query
  	var north = req.query.north;
  	var south = req.query.south;
  	var east = req.query.east;
  	var west = req.query.west;

	connection.query('SELECT * FROM portals WHERE (Latitude < ?) AND (Latitude > ?) AND (Longitude < ?) AND (Longitude > ?)', [north, south, east, west] , function (error, results) {
		if(error) {
			console.log('query error');
			console.log(east);
		}
		else {
			res.send(results);
			console.log('query success');
		}
	});
});

router.get('/list', function(req, res, next) {
  	// DB query
	connection.query('SELECT * FROM portals', function (error, results) {
		if(error) {
			console.log('query error');
		}
		else {
			res.render('list', { data: results});
			console.log('query success');
		}
	});
});

router.get('/edit/:id', function(req, res, next) {
	// DB query
	connection.query('SELECT * FROM portals WHERE id = ?', [req.params.id], function (error, result) {
		if(error) {
			console.log('query error');
		}
		else {
			res.render('edit', { data: result[0]});
			console.log('query success');
		}
	});
});

router.post('/edit/:id', function (req, res) {
	var body = req.body;
	// DB query
	connection.query('UPDATE portals SET Mark=? WHERE id = ?', [body.Mark, req.params.id], function () {
		res.redirect('/');
	});
});

module.exports = router;
