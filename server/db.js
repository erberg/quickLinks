var databaseURI = "mongodb://localhost:27017/quicklinks";

var MongoClient = require("mongodb").MongoClient,
    assert = require('assert'),
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    path = require('path');
// var httpProxy = require('http-proxy');  		//yer
// var apiProxy = httpProxy.createProxyServer();  	//yer

app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(8080);

app.use('/quicklinks', express.static('/var/www/public/links/app/'));

/**
 *	Expected data format:
 *	[{
 *		type: "url2", 
 *		value:"valuetest2", 
 *		name:"nametest2", 
 *		categories: ['one','two']
 *	}]
 */

app.get('/api/links', function(req, res) {
	MongoClient.connect(databaseURI, function(err, db) {
	    db.collection('links').find({}).sort({'name':1}).toArray(function (err,docs) {
	    	res.json(docs);
	    	db.close();
	    });
	});
});

app.get('/api/link/:link_id', function(req, res) {
	MongoClient.connect(databaseURI, function(err, db) {
	    var objectID = require("mongodb").ObjectID;
	    var o_id = new objectID(req.params.link_id);
	    var findQuery = { '_id' : o_id };
	    db.collection('links').find(findQuery).sort({'name':1}).toArray(function (err,docs) {
	    	res.json(docs[0]);
	    	db.close();
	    });
	});
});