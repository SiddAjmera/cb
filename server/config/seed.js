/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');


Thing.find({}).remove(function() {
  Thing.create({
    name : 'Development Tools',
    info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
  }, {
    name : 'Server and Client integration',
    info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
  }, {
    name : 'Smart Build System',
    info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
    name : 'Modular Structure',
    info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    name : 'Optimized Build',
    info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    name : 'Deployment Ready',
    info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
  });
});

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    contactNo: 84464828121,
    password: 'test',
    empId: 306894,
    empName: "Jagdeep",
    officeAddress: "Hinjewadi Phase 3",
    homeAddress: "Mega Polis",
    startTime: "10-11",
    endTime: "20-21"
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
     password: 'test',
    contactNo: 84464828121,
    empId: 962060,
    empName: "Siddharth",
    officeAddress: "Hinjewadi Phase 3",
    homeAddress: "Wakad",
    startTime: "09-16",
    endTime: "15-24"
  }, function() {
      console.log('finished populating users');
    }
  );
});

/*Ride.find({}).remove(function(){
  Ride.create({
    rideId: 12345678,
    offeredByUser : new User(9876543210,456781,"John Doe","Sahyadri Park","Wakad","09-24","15-56"),
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' }),
    companions: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
    source: "Wakad",
    destination: "Hinjewadi",
    windowForDeparture: 40,
    availableSeats: 3
  });
});*/