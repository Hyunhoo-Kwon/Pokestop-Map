var mysql = require('mysql');

// connect DB
var connection = mysql.createConnection({
	host: 'host',
	user: 'user',
	password: 'password',
	port: 'port',
	database: 'pokestopmapdb'
});

module.exports = connection;