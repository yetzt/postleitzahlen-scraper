const fs = require("fs");
const path = require("path");
const https = require("https");

// https agent with keepalive
const agent = new https.Agent({ keepAlive: true });

// destinations
const dest = {
	json: path.resolve(__dirname, "postcodes.json"),
	geojson: path.resolve(__dirname, "postcodes.geojson"),
};

// collect postcodes
const result = {};

// collect geojson
const geojson = {
	type: "FeatureCollection",
	crs: { type: "name", properties: { name: "EPSG:4326" }},
	features: [],
};

// fetch helper
const fetch = function fetch(url, headers, postdata, fn){

	let canceled = false;
	let timeout = setTimeout(() => {
		canceled = true;
		request.destroy();
		return fn(new Error("Timeout"));
	}, 3000);

	let request = https.request(url, {
		method: (postdata) ? "POST" : "GET",
		agent,
		headers,
		timeout: 3000,
		rejectUnauthorized: false,
		requestCert: false,
	}, function(response){
		if (canceled) return;
		clearTimeout(timeout);

		if (response.statusCode !== 200) {
			request.destroy();
			return fn(new Error(response.statusCode));
		}

		let buffers = [];
		response.on("data", function(chunk){
			buffers.push(chunk)
		}).once("end", function(){
			fn(null, Buffer.concat(buffers));
		});

	}).on("error", function(err){
		if (canceled) return;
		clearTimeout(timeout);
		fn(err);
	});

	if (postdata) request.write(postdata);
	request.end();

};

// queue helper
const queue = function queue(concurrency){
	if (!(this instanceof queue)) return new queue(...arguments);
	this.queue = [];
	this.started = 0;
	this.complete = 0;
	this.concurrency = concurrency;
	return this;
};

queue.prototype.push = function(){
	this.queue.push(...arguments);
	return this;
};

queue.prototype.run = function(fn){
	const self = this;
	if (this.queue.length === 0 && this.started === this.complete) return fn();
	while (this.queue.length > 0 && this.started - this.complete < this.concurrency) {
		this.started++;
		this.queue.shift().call(null, function(){
			self.complete++;
			self.run(fn);
		});
	};
	return this;
};

// queue instance
const q = queue(10, true);

// create all 100 two-number prefixes
Array(100).fill(0).map(function(n,i){
	return i.toString().padStart(2,"0");
}).forEach(function(p){
	q.push(function(next){
		// request all postcodes for the prefix
		fetch("https://www.postdirekt.de/plzserver/PlzAjaxServlet", { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, "finda=city&city="+p+"&lang=de_DE", function(err, data){
			if (err) return console.error("Error:", p, err.toString()), next();
			try {
				data = JSON.parse(data);
			} catch (err) {
				return console.error("Error:", p, err.toString()), next();
			}
			if (data.count) data.rows.forEach(function(row){
				result[row.plz] = true; // use property to ensure unique
			});
			next();
		});
	});
});

q.run(function(){

	// convert to array and sort
	postcodes = Object.keys(result).sort();

	// save
	fs.writeFile(dest.json, JSON.stringify(postcodes,null,"\t"), function(){
		console.log("saved postcodes.json");

		postcodes.forEach(function(plz){
			q.push(function(next){
				// fetch geojson shape for postcode
				fetch("https://www.postdirekt.de/plzserver/postcode?code="+plz, { }, false, function(err, data){
					if (err) return console.error("Error:", plz, err.toString()), next();
					try {
						data = JSON.parse(data);
					} catch (err) {
						return console.error("Error:", plz, err.toString()), next();
					}
					if (data.features) geojson.features.push(...data.features);
					next();
				});
			});
		});

		q.run(function(){
			// save
			fs.writeFile(dest.geojson, JSON.stringify(geojson), function(){
				console.log("saved postcodes.geojson");
			});
		});

	});
});

