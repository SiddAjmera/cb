/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var mongoose = require('mongoose');
//var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Vehicle = require('../api/vehicle/vehicle.model');
var Ride = require('../api/ride/ride.model');


/*Thing.find({}).remove(function() {
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
});*/

Vehicle.create({
    vehicleNo: "MH 14 JZ 1234",
    capacity: "4",
    make: "Honda",
    model: "City",
    rfid: "ThisIsASampleRFID1",
    pictureUrl: "http://images0.cardekho.com/images/car-images/520x216/Honda/Honda-City/Golden-brown-metallic.jpg"
  },{
    vehicleNo: "MH 14 RF 2345",
    capacity: "4",
    make: "Audi",
    model: "A4",
    rfid: "ThisIsASampleRFID2",
    pictureUrl: "https://upload.wikimedia.org/wikipedia/commons/0/01/Audi_A4_2.0_TDI_Ambition_(B8,_Facelift)_%E2%80%93_Frontansicht,_30._Juli_2012,_Ratingen.jpg"
  },{
    vehicleNo: "MH 14 RF 3456",
    capacity: "4",
    make: "Audi",
    model: "TT",
    rfid: "ThisIsASampleRFID3",
    pictureUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/2007_Audi_TT_(8J)_2.0_TFSI_coupe_01.jpg"
  },{
    vehicleNo: "MH 14 RF 4567",
    capacity: "6",
    make: "Renault",
    model: "Duster",
    rfid: "ThisIsASampleRFID4",
    pictureUrl: "http://images0.cardekho.com/images/car-images/large/Renault/Renault-Duster/duster-black.jpg"
  },{
    vehicleNo: "MH 14 RF 5678",
    capacity: "4",
    make: "Lexus",
    model: "CT200H",
    rfid: "ThisIsASampleRFID5",
    pictureUrl: "http://www.lexus.com/cm-img/gallery/2015-Lexus-CT-fsport-exterior-silver-lining-metallic-action-thumbnail-476x357-LEXCTHMY14008101.jpg"
  },{
    vehicleNo: "MH 14 RF 6789",
    capacity: "2",
    make: "Bajaj",
    model: "Pulsar RS200",
    rfid: "ThisIsASampleRFID6",
    pictureUrl: "http://www.zigcdn.com/media/content/2015/Apr/bajaj-pulsar-rs200-first-ride-zigwheels-07042015-m00_560x420.jpg"
  },{
    vehicleNo: "MH 14 RF 7890",
    capacity: "2",
    make: "Bugatti",
    model: "Veyron 16.4",
    rfid: "ThisIsASampleRFID7",
    pictureUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Bugatti_Veyron_16.4_%E2%80%93_Frontansicht_(1),_5._April_2012,_D%C3%BCsseldorf.jpg"
  },{
    vehicleNo: "MH 14 RF 8901",
    capacity: "4",
    make: "Mercedes",
    model: "AMG C 63 Coupé",
    rfid: "ThisIsASampleRFID8",
    pictureUrl: "https://www.mercedes-benz.com/wp-content/uploads/sites/3/2015/08/00-Mercedes-Benz-Vehicles-C-Class-C-63-Coupe-AMG-1180x559.jpg"
  }, function(){
    console.log('Finished populating Vehicles');
  });

User.create({
    provider: 'local',
    name: 'Jagdeep',
    email: 'jagdeep@jagdeep.com',
    contactNo: 9876543210,
    password: 'Jagdeep@123',
    empId: 987654,
    empName: "Jagdeep Singh Soni",
    photoUrl: "https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/005/08a/0fe/2c2b6bb.jpg",
    vehicle: mongoose.Types.ObjectId("5660167ab6df47d026dafbc5"),
    officeAddress: "Jagdeep Office",
    homeAddress: "Jagdeep Home",
    startTime: "09-11",
    endTime: "20-21"
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Siddharth',
    email: 'siddharth@siddharth.com',
    password: 'Siddharth@123',
    contactNo: 8765432109,
    empId: 876543,
    empName: "Siddharth Ajmera",
    photoUrl: "https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAALvAAAAJDQyNGQ1MDI0LTFmYmEtNGNlMy05ZTkzLWI4OWU1OTdhMDUzOQ.jpg",
    officeAddress: "Siddharth Office",
    homeAddress: "Siddharth Home",
    startTime: "09-16",
    endTime: "15-24"
  },{
    provider: 'local',
    role: 'user',
    name: 'Parvez',
    email: 'parvez@parvez.com',
    password: 'Parvez@123',
    contactNo: 7654321098,
    empId: 765432,
    empName: "Parvez Patel",
    photoUrl: "https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/005/055/092/193511e.jpg",
    vehicle: mongoose.Types.ObjectId("5660167ab6df47d026dafbc9"),
    officeAddress: "Parvez Office",
    homeAddress: "Parvez Home",
    startTime: "09-16",
    endTime: "15-24"
  },{
    provider: 'local',
    role: 'user',
    name: 'Ninad',
    email: 'ninad@ninad.com',
    password: 'Ninad@123',
    contactNo: 9638527410,
    empId: 654321,
    empName: "Ninad Mahajan",
    photoUrl: "https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png",
    officeAddress: "Ninad Office",
    homeAddress: "Ninad Home",
    startTime: "09-16",
    endTime: "15-24",
    vehicle: mongoose.Types.ObjectId("5660167ab6df47d026dafbc4")
  },{
    provider: 'local',
    role: 'user',
    name: 'Ashraf',
    email: 'ashraf@ashraf.com',
    password: 'Ashraf@123',
    contactNo: 8527419630,
    empId: 543210,
    empName: "Mohd. Ashraf",
    photoUrl: "https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png",
    officeAddress: "Ashraf Office",
    homeAddress: "Ashraf Home",
    startTime: "09-16",
    endTime: "15-24"
  },function(){
    console.log('Finished populating Users');
  });

Ride.find({}).remove(function(){
  Ride.create({
    rideId: 12345678,
    offeredByUser : mongoose.Types.ObjectId("56601723647a6dac029d21e8"),
    vehicle: mongoose.Types.ObjectId("5660167ab6df47d026dafbc5"),
    companions: [ mongoose.Types.ObjectId("56601723647a6dac029d21eb"), mongoose.Types.ObjectId("56601723647a6dac029d21e9") ],
    source: "Wakad",
    destination: "Hinjewadi",
    windowForDeparture: 40,
    availableSeats: 3
  },{
    rideId: 12345678,
    offeredByUser : mongoose.Types.ObjectId("56601723647a6dac029d21ea"),
    vehicle: mongoose.Types.ObjectId("5660167ab6df47d026dafbc9"),
    companions: [ mongoose.Types.ObjectId("56601723647a6dac029d21ec")],
    source: "Wakad",
    destination: "Hinjewadi",
    windowForDeparture: 40,
    availableSeats: 3
  }, function(){
    console.log('Finished Populating Rides');
  });
});