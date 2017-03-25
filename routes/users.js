var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* naver search */
var client_id = 's7zk_O6gaHEdEqa41R4Q';
var client_secret = 'Mb7jAKpBLU';

var query = '강남역 카페';

router.get('/search/:search', function(req, res, next) {
	var request = require('request');

  query = req.params.search;

	console.log(query);
	var api_url = 'https://openapi.naver.com/v1/search/local?query=' + encodeURI(query) + '&display=100';
	var options = {
       url: api_url,
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };

    request(options, function (error, response, body) {
    	if (!error && response.statusCode == 200) {
    		res.send(body);
    	}
    	else {
       		console.log('error = ' + response.statusCode);
     	}
    });
});

module.exports = router;
