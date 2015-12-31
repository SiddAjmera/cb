/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var mongoose = require('mongoose');
var User = require('../api/user/user.model');
var Vehicle = require('../api/vehicle/vehicle.model');
var Ride = require('../api/ride/ride.model');
var Team = require('../api/team/team.model');
Vehicle.remove(function(){
Vehicle.create({
    vehicleLicenseNumber: "MH 14 JZ 1234",
    capacity: "4",
    make: "Honda",
    model: "City",
    rfid: "ThisIsASampleRFID1",
    pictureUrl: "http://images0.cardekho.com/images/car-images/520x216/Honda/Honda-City/Golden-brown-metallic.jpg"
  },{
    vehicleLicenseNumber: "MH 14 RF 2345",
    capacity: "4",
    make: "Audi",
    model: "A4",
    rfid: "ThisIsASampleRFID2",
    pictureUrl: "https://upload.wikimedia.org/wikipedia/commons/0/01/Audi_A4_2.0_TDI_Ambition_(B8,_Facelift)_%E2%80%93_Frontansicht,_30._Juli_2012,_Ratingen.jpg"
  },{
    vehicleLicenseNumber: "MH 14 RF 3456",
    capacity: "4",
    make: "Audi",
    model: "TT",
    rfid: "ThisIsASampleRFID3",
    pictureUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/2007_Audi_TT_(8J)_2.0_TFSI_coupe_01.jpg"
  },{
    vehicleLicenseNumber: "MH 14 RF 4567",
    capacity: "6",
    make: "Renault",
    model: "Duster",
    rfid: "ThisIsASampleRFID4",
    pictureUrl: "http://images0.cardekho.com/images/car-images/large/Renault/Renault-Duster/duster-black.jpg"
  },{
    vehicleLicenseNumber: "MH 14 RF 5678",
    capacity: "4",
    make: "Lexus",
    model: "CT200H",
    rfid: "ThisIsASampleRFID5",
    pictureUrl: "http://www.lexus.com/cm-img/gallery/2015-Lexus-CT-fsport-exterior-silver-lining-metallic-action-thumbnail-476x357-LEXCTHMY14008101.jpg"
  },{
    vehicleLicenseNumber: "MH 14 RF 6789",
    capacity: "2",
    make: "Bajaj",
    model: "Pulsar RS200",
    rfid: "ThisIsASampleRFID6",
    pictureUrl: "http://www.zigcdn.com/media/content/2015/Apr/bajaj-pulsar-rs200-first-ride-zigwheels-07042015-m00_560x420.jpg"
  },{
    vehicleLicenseNumber: "MH 14 RF 7890",
    capacity: "2",
    make: "Bugatti",
    model: "Veyron 16.4",
    rfid: "ThisIsASampleRFID7",
    pictureUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Bugatti_Veyron_16.4_%E2%80%93_Frontansicht_(1),_5._April_2012,_D%C3%BCsseldorf.jpg"
  },{
    vehicleLicenseNumber: "MH 14 RF 8901",
    capacity: "4",
    make: "Mercedes",
    model: "AMG C 63 Coupé",
    rfid: "ThisIsASampleRFID8",
    pictureUrl: "https://www.mercedes-benz.com/wp-content/uploads/sites/3/2015/08/00-Mercedes-Benz-Vehicles-C-Class-C-63-Coupe-AMG-1180x559.jpg"
  }, function(){
    console.log('Finished populating Vehicles');
  });
    });
User.remove(function(){
User.create({
    empId: '111111',
    empName: 'Jagdeep Singh Soni',
    contactNo: '9876543210',
    gender: 'Male',
    homeAddress: 'Jagdeep Home',
    city: 'Pune',
    zipcode: '411057',
    officeAddress: 'Jagdeep Office',
    timeSlot: '9:00 AM - 7:00 PM',
    username: '111111',
    password: "123",
    userId: '111111',
    userPhotoUrl: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/005/08a/0fe/2c2b6bb.jpg',
    vehicle: {
        capacity: '2',
        vehicleNo: 'MH 09 JZ 7903'
    },
    homeLocationCoordinates: [ 18.574381, 73.681143 ],
    email: 'jagdeep@tcs.com'
  }, {
    empId: '111112',
    empName: 'Siddharth Ajmera',
    contactNo: '9876543211',
    gender: 'Male',
    homeAddress: 'Siddharth Home',
    city: 'Pune',
    zipcode: '411057',
    officeAddress: 'Siddharth Office',
    timeSlot: '9:00 AM - 7:00 PM',
    username: '111112',
    password: "123",
    userId: '111112',
    userPhotoUrl: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAALvAAAAJDQyNGQ1MDI0LTFmYmEtNGNlMy05ZTkzLWI4OWU1OTdhMDUzOQ.jpg',
    vehicle: {
        capacity: '2',
        vehicleNo: 'MP 13 JZ 7903'
    },
    homeLocationCoordinates: [ 18.578157, 73.686889 ],
    email: 'siddharth@tcs.com'
  },{
    empId: '111113',
    empName: 'Parvez Patel',
    contactNo: '9876543212',
    gender: 'Male',
    homeAddress: 'Parvez Home',
    city: 'Pune',
    zipcode: '411057',
    officeAddress: 'Parvez Office',
    timeSlot: '9:00 AM - 7:00 PM',
    username: '111113',
    password: "123",
    userId: '111113',
    userPhotoUrl: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/005/055/092/193511e.jpg',
    vehicle: {
        capacity: '2',
        vehicleNo: 'GJ 16 JZ 7903'
    },
    homeLocationCoordinates: [ 18.592117, 73.762857 ],
    email: 'parvez@tcs.com'
  },{
    empId: '111114',
    empName: 'Ninad Mahajan',
    contactNo: '9876543213',
    gender: 'Male',
    homeAddress: 'Ninad Home',
    city: 'Pune',
    zipcode: '411057',
    officeAddress: 'Ninad Office',
    timeSlot: '9:00 AM - 7:00 PM',
    username: '111114',
    password: "123",
    userId: '111114',
    userPhotoUrl: 'https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png',
    vehicle: {
        capacity: '2',
        vehicleNo: 'MH 16 JZ 7903'
    },
    homeLocationCoordinates: [ 18.616153, 73.778059 ],
    email: 'ninad@tcs.com'
  },{
    empId: '111115',
    empName: 'Md Ashraf',
    contactNo: '9876543214',
    gender: 'Male',
    homeAddress: 'Ashraf Home',
    city: 'Pune',
    zipcode: '411057',
    officeAddress: 'Ashraf Office',
    timeSlot: '9:00 AM - 7:00 PM',
    username: '111115',
    password: "123",
    userId: '111115',
    userPhotoUrl: 'https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png',
    vehicle: {
        capacity: '2',
        vehicleNo: 'MP 01 JZ 7903'
    },
    homeLocationCoordinates: [ 18.623647, 73.810078 ],
    email: 'ashraf@tcs.com'
  },function(){
    console.log('Finished populating Users');
});
});
Ride.remove(function(){
Ride.create({
    rideId: 12345678,
    offeredByUser : mongoose.Types.ObjectId("56601723647a6dac029d21e8"),
    vehicle: mongoose.Types.ObjectId("5660167ab6df47d026dafbc5"),
    companions: [ mongoose.Types.ObjectId("56601723647a6dac029d21eb"), mongoose.Types.ObjectId("56601723647a6dac029d21e9") ],
    source: "Wakad",
    destination: "Hinjewadi",
    windowForDeparture: 15,
    availableSeats: 3,
    active: true
  },{
    rideId: 23456789,
    offeredByUser : mongoose.Types.ObjectId("56601723647a6dac029d21ea"),
    vehicle: mongoose.Types.ObjectId("5660167ab6df47d026dafbc9"),
    companions: [ mongoose.Types.ObjectId("56601723647a6dac029d21ec")],
    source: "Wakad",
    destination: "Sahyadri Park",
    windowForDeparture: 40,
    availableSeats: 1,
    active: true
  }, function(){
    console.log('Finished Populating Rides');
  });
});
Team.remove(function(){
Team.create({
    teamId: 1000,
    name: "Monday Mornings",
    admin: mongoose.Types.ObjectId("56601723647a6dac029d21e8"),
    members: [ mongoose.Types.ObjectId("56601723647a6dac029d21eb"), mongoose.Types.ObjectId("56601723647a6dac029d21e9") ]
},{
    teamId: 1001,
    name: "Monday Evenings",
    admin: mongoose.Types.ObjectId("56601723647a6dac029d21ea"),
    members: [ mongoose.Types.ObjectId("56601723647a6dac029d21ec")],
}, function(){
    console.log('Finished populating Teams');
});
});