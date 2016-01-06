'use strict';

var _ = require('lodash');
var fs = require('fs');
var Location = require('../api/location/location.model');

exports.seedLocations = function(){
	fs.readFile('server/config/locations.json', function(err, data){
		if(err) console.log('Error : ' + err);
		else{
			data = data.toString();
			var locationsArray = JSON.parse(data);
			Location.create(locationsArray, function(err, location) {
		  	if(err) console.log('Error Seeding Locations : ' + err);
		  	else console.log('Locations Seeded Successfully');
		  });
		}
	})
}