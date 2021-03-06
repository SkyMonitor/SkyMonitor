var http = require('http');
var connect = require('connect');
var url = require('url');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var assert = require('assert');
var queries = require('./queries.js');
var pointsSourceURL = require('./pointsSourceURL.js').options;
var db = new Db('db', new Server('localhost', 27017), {safe: false});

var Points = "";
var liveTracking = false;

db.open(function (err, db) {
	assert.equal(null, err);

	var collection = db.collection('system.js');
	var airWaysSearch = queries.airWaysSearch;
	collection.remove({_id: "airWaysSearch"}, function (err, nbOfDocs) {
		collection.insert({_id: "airWaysSearch", value: airWaysSearch}, {serializeFunctions: true}, function (err, result) {
			db.close();
		});
	});
});

function queryDb(res, coll, cmdOptions) {
	var mongoCmdOpts = queries.prepare(coll, cmdOptions);
	
	db.open(function (err, db) {
		assert.equal(null, err);
		
		var collection = db.collection(coll);
		var query = queries.query(coll);
		for (var key in mongoCmdOpts) {
			query[key] = mongoCmdOpts[key];
		}
		var options = queries.options;

		collection.find(query, options).toArray(function(err, results) {
			db.close();
			res.end(JSON.stringify(results));
		});
	});
}

setInterval(function() {
	if (liveTracking) {
		var myReq = http.get(pointsSourceURL, function(myRes) {
			var bodyChunks = [];
			myRes.on('data', function(chunk) {
				bodyChunks.push(chunk);
			}).on('end', function() {
				var body = Buffer.concat(bodyChunks).toString();
				var regExp = /pd_callback.*/;
				var pd_callback = regExp.exec(body)[0];
				Points = pd_callback.substring(12,pd_callback.length-2);
			});
		});

		myReq.on('error', function(e) {
			console.log(e.message);
		});
	}
},2500);

var app = connect()
	.use(connect.static(__dirname))
	.use(function(req, res){
		var page = url.parse(req.url).pathname;
		var cmd = page.substring(1, page.length);
		if (cmd == "livePts") {
			res.end(Points);
		} else {
			var cmdModif = cmd.replace(/%7B/g,"{").replace(/%7D/g,"}").replace(/%22/g,"\u0022");
			var cmdObj = JSON.parse(cmdModif);
			if (cmdObj.type == 'livePts') {
				liveTracking = cmdObj.options;
			} else {
				queryDb(res, cmdObj.type, cmdObj.options);
			}
		}
	})

http.createServer(app).listen(1337);
