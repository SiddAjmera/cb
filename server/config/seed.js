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

var SeedData = require('./seedData');

User.create({
    empId: '111111',
    empName: 'Jagdeep Singh Soni',
    contactNo: '9876543210',
    gender: 'Male',
    homeAddress: 'Jagdeep Home',
    city: 'Pune',
    state: 'Maharashtra',
    zipcode: '411057',
    officeAddress: 'Jagdeep Office',
    timeSlot: '9:00 AM - 7:00 PM',
    redgId:"APA91bGo64zn22up2LWQf08Hk40jaozA1zPQ5OMvP-xbkcMEpSu2y3GUnLkVHSs73ZDRQ2cM5_Ic2t-7hpjoBp-5f2IeIHaXZrq5h18bXLgBjyTLFFlOZUg",
    password: "123",
    userId: '111111',
    userPhotoUrl: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/005/08a/0fe/2c2b6bb.jpg',
    homeAddressLocation: {
        formatted_address: "MIDC Phase III Main Rd, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
        display_address: "Splendour, MegaPolis",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6861693000000740, 18.5791973000000010],
        placeId: "ChIJTdb_0G27wjsRDJzfJDgUqH4"
    },
    officeAddressLocation: {
        formatted_address: "Sahyadri Park, Plot No. 2 & 3, Rajiv Gandhi Infotech Park, Phase-III,, Hinjewadi, Pune, Maharashtra 411057, India",
        display_address: "TCS Sahyadri Park",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6829261999999970,  18.5806206000000000],
        placeId: "ChIJz2_Fp2XAwjsRf-D83a7sne8"
    },
    vehicle: [{
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
    }],
    homeLocationCoordinates: [ 73.681143, 18.574381 ],
    shiftTimeIn: "9:00 AM",
    shiftTimeout: "6:00 PM",
    email: 'jagdeep@tcs.com',
    rating: 5
  }, {
    empId: '111112',
    empName: 'Siddharth Ajmera',
    contactNo: '9876543211',
    gender: 'Male',
    homeAddress: 'Siddharth Home',
    city: 'Pune',
    state: 'Maharashtra',
    zipcode: '411057',
    officeAddress: 'Siddharth Office',
    timeSlot: '9:00 AM - 7:00 PM',
    username: '111112',
    password: "123",
    redgId:"ewhpNzHAo_A:APA91bGDocSZu1S2e31LMV6T0EdvdzAwRfDsECxHdMKMyoSF6XBD_C4KqBI4kyLyLD3zEEgzDs_mbCpiiw-1BLgDmAJbnPVhkKme5EreDKvBvxCVZiowsuJZ-taFUNkkxoqSU0tn9635",
    userPhotoUrl: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAALvAAAAJDQyNGQ1MDI0LTFmYmEtNGNlMy05ZTkzLWI4OWU1OTdhMDUzOQ.jpg',
    homeAddressLocation: {
        formatted_address: "MIDC Phase III Main Rd, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
        display_address: "Sangaria, MegaPolis",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6861693000000740, 18.5791973000000010]
    },
    officeAddressLocation: {
        formatted_address: "Sahyadri Park, Plot No. 2 & 3, Rajiv Gandhi Infotech Park, Phase-III,, Hinjewadi, Pune, Maharashtra 411057, India",
        display_address: "TCS Sahyadri Park",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6829261999999970,  18.5806206000000000],
        placeId: "ChIJz2_Fp2XAwjsRf-D83a7sne8"
    },
    vehicle: [{
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
    }],
    homeLocationCoordinates: [ 73.686889, 18.578157 ],
    shiftTimeIn: "9:00 AM",
    shiftTimeout: "6:00 PM",
    email: 'siddharth@tcs.com',
    rating: 4
  },{
    empId: '111113',
    empName: 'Parvez Patel',
    contactNo: '9876543212',
    gender: 'Male',
    homeAddress: 'Parvez Home',
    city: 'Pune',
    state: 'Maharashtra',
    zipcode: '411057',
    officeAddress: 'Parvez Office',
    timeSlot: '9:00 AM - 7:00 PM',
    username: '111113',
    password: "123",
    userId: '111113',
    redgId:"ewhpNzHAo_A:APA91bGDocSZu1S2e31LMV6T0EdvdzAwRfDsECxHdMKMyoSF6XBD_C4KqBI4kyLyLD3zEEgzDs_mbCpiiw-1BLgDmAJbnPVhkKme5EreDKvBvxCVZiowsuJZ-taFUNkkxoqSU0tn9635",
    userPhotoUrl: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/005/055/092/193511e.jpg',
    homeAddressLocation: {
        formatted_address: "MIDC Phase III Main Rd, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
        display_address: "Sangaria, MegaPolis",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6861693000000740, 18.5791973000000010]
    },
    officeAddressLocation: {
        formatted_address: "Sahyadri Park, Plot No. 2 & 3, Rajiv Gandhi Infotech Park, Phase-III,, Hinjewadi, Pune, Maharashtra 411057, India",
        display_address: "TCS Sahyadri Park",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6829261999999970,  18.5806206000000000],
        placeId: "ChIJz2_Fp2XAwjsRf-D83a7sne8"
    },
    vehicle: [{
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
    }],
    homeLocationCoordinates: [ 73.762857, 18.592117 ],
    shiftTimeIn: "9:00 AM",
    shiftTimeout: "6:00 PM",
    email: 'parvez@tcs.com',
    rating: 2
  },{
    empId: '111114',
    empName: 'Ninad Mahajan',
    contactNo: '9876543213',
    gender: 'Male',
    homeAddress: 'Ninad Home',
    city: 'Pune',
    state: 'Maharashtra',
    zipcode: '411057',
    officeAddress: 'Ninad Office',
    timeSlot: '9:00 AM - 7:00 PM',
    username: '111114',
    password: "123",
    userId: '111114',
    redgId:"cwseZgmg0n8:APA91bGe_gDw-upSJz4cnRfbv0mvZoqOIYN8K-q_EeGfReZ372QNjxqHvXfyZTCl-kAtfORda3dBeHbqJVoiCBvvEC7cXoqaxiE8bKaXg_zNMmGHb3ZtFHPym9_I-gwRbFCYDfLwEAsW",
    userPhotoUrl: 'https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png',
    homeAddressLocation: {
        formatted_address: "MIDC Phase III Main Rd, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
        display_address: "Sangaria, MegaPolis",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6861693000000740, 18.5791973000000010]
    },
    officeAddressLocation: {
        formatted_address: "Sahyadri Park, Plot No. 2 & 3, Rajiv Gandhi Infotech Park, Phase-III,, Hinjewadi, Pune, Maharashtra 411057, India",
        display_address: "TCS Sahyadri Park",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6829261999999970,  18.5806206000000000],
        placeId: "ChIJz2_Fp2XAwjsRf-D83a7sne8"
    },
    vehicle: [{
        vehicleLicenseNumber: "MH 14 RF 7890",
        capacity: "2",
        make: "Bugatti",
        model: "Veyron 16.4",
        rfid: "ThisIsASampleRFID7",
        pictureUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Bugatti_Veyron_16.4_%E2%80%93_Frontansicht_(1),_5._April_2012,_D%C3%BCsseldorf.jpg"
    }],
    homeLocationCoordinates: [ 73.778059, 18.616153 ],
    shiftTimeIn: "9:00 AM",
    shiftTimeout: "6:00 PM",
    email: 'ninad@tcs.com',
    rating: 1
  },{
    empId: '111115',
    empName: 'Md Ashraf',
    contactNo: '9876543214',
    gender: 'Male',
    homeAddress: 'Ashraf Home',
    city: 'Pune',
    state: 'Maharashtra',
    zipcode: '411057',
    officeAddress: 'Ashraf Office',
    timeSlot: '9:00 AM - 7:00 PM',
    username: '111115',
    password: "123",
    userId: '111115',
    redgId:"ewhpNzHAo_A:APA91bGDocSZu1S2e31LMV6T0EdvdzAwRfDsECxHdMKMyoSF6XBD_C4KqBI4kyLyLD3zEEgzDs_mbCpiiw-1BLgDmAJbnPVhkKme5EreDKvBvxCVZiowsuJZ-taFUNkkxoqSU0tn9635",
    userPhotoUrl: 'https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png',
    homeAddressLocation: {
        formatted_address: "MIDC Phase III Main Rd, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
        display_address: "Sangaria, MegaPolis",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6861693000000740, 18.5791973000000010]
    },
    officeAddressLocation: {
        formatted_address: "Sahyadri Park, Plot No. 2 & 3, Rajiv Gandhi Infotech Park, Phase-III,, Hinjewadi, Pune, Maharashtra 411057, India",
        display_address: "TCS Sahyadri Park",
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location: [73.6829261999999970,  18.5806206000000000],
        placeId: "ChIJz2_Fp2XAwjsRf-D83a7sne8"
    },
    vehicle: [{
        vehicleLicenseNumber: "MH 14 RF 8901",
        capacity: "4",
        make: "Mercedes",
        model: "AMG C 63 Coupé",
        rfid: "ThisIsASampleRFID8",
        pictureUrl: "https://www.mercedes-benz.com/wp-content/uploads/sites/3/2015/08/00-Mercedes-Benz-Vehicles-C-Class-C-63-Coupe-AMG-1180x559.jpg"
    }],
    homeLocationCoordinates: [ 73.810078, 18.623647 ],
    shiftTimeIn: "9:00 AM",
    shiftTimeout: "6:00 PM",
    email: 'ashraf@tcs.com',
    rating: 5
  },function(){
    console.log('Finished populating Users');
});

/*Ride.create({
    routeSummary : "Phase 2 Rd",
    initiallyAvailableSeats : 4,
    comments : "Please dont be late",
    rideStatus : "ACTIVE",
    currentlyAvailableSeats : 4,
    modifiedDate : 1454907600000,
    createdDate : 1454907600000,
    rideStatistics : {
        rideEndTime : 1454907600000,
        rideStartTime : 1454907600000
    },
    offeredBy : {
        empId : "111114",
        empName : "Ninad Mahajan",
        gender : "Male",
        contactNo : "9876543213",
        userPhotoUrl : "https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png"
    },
    rideScheduledTime : 1454907600000,
    endLocation : {
        formatted_address : "Bhumkar Bridge, Wakad, Pune, Maharashtra 411057, India",
        display_address : "Bhumkar Bridge",
        icon : "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location : [ 
            73.7526237999999950,
            18.6059373000000010
        ],
        placeId : "ChIJ5-6NE3y5wjsR5Q4o_NfuSFU"
    },
    startLocation : {
        formatted_address : "S1/Poorna, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
        display_address : "S1/Poorna",
        icon : "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
        location : [ 
            73.6848913999999980,
            18.5813442000000000
        ],
        placeId : "ChIJ6UG68Gy7wjsRs4AJ2njAyHc"
    }
  }, function(){
    console.log('Finished Populating Rides');
});*/

Team.create({
    "name": "Monday Morning Commute",
    "createdBy": {
        "empId": "111111",
        "empName": "Jagdeep Singh Soni",
        "contactNo": "9876543210",
        "userPhotoUrl": "https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/005/08a/0fe/2c2b6bb.jpg",
        "redgId": "APA91bGo64zn22up2LWQf08Hk40jaozA1zPQ5OMvP-xbkcMEpSu2y3GUnLkVHSs73ZDRQ2cM5_Ic2t-7hpjoBp-5f2IeIHaXZrq5h18bXLgBjyTLFFlOZUg"
    },
    "members": [{
        "empId": "111112",
        "empName": "Siddharth Ajmera",
        "contactNo": "9876543211",
        "userPhotoUrl": "https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAALvAAAAJDQyNGQ1MDI0LTFmYmEtNGNlMy05ZTkzLWI4OWU1OTdhMDUzOQ.jpg",
        "membershipStatus": "PENDING",
        "redgId": "APA91bGo64zn22up2LWQf08Hk40jaozA1zPQ5OMvP-xbkcMEpSu2y3GUnLkVHSs73ZDRQ2cM5_Ic2t-7hpjoBp-5f2IeIHaXZrq5h18bXLgBjyTLFFlOZUg"
    },{
        "empId": "111113",
        "empName": "Parvez Patel",
        "contactNo": "9876543212",
        "userPhotoUrl": "https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/005/055/092/193511e.jpg",
        "membershipStatus": "PENDING",
        "redgId": "APA91bGo64zn22up2LWQf08Hk40jaozA1zPQ5OMvP-xbkcMEpSu2y3GUnLkVHSs73ZDRQ2cM5_Ic2t-7hpjoBp-5f2IeIHaXZrq5h18bXLgBjyTLFFlOZUg"
    }],
    "activities" : [
        {
            "activity": "Jagdeep formed a team",
            "activityTime": 1457958600000
        },
        {
            "activity": "Jagdeep added Siddharth to the team",
            "activityTime": 1457958700000
        },
        {
            "activity": "Siddharth accepted Jagdeep's membership request",
            "activityTime": 1457958800000
        },
        {
            "activity": "Jagdeep added Parvez to the team",
            "activityTime": 1457958900000
        },
        {
            "activity": "Parvez accepted Jagdeep's membership request",
            "activityTime": 1457959000000
        }
    ],
    "rideDetails": {
        "home": {
            "formatted_address" : "Test Team Formation 1",
            "display_address" : "S1/Poorna",
            "icon" : "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
            "location" : [ 
                73.6848913999999980,
                18.5813442000000000
            ],
            "placeId" : "ChIJ6UG68Gy7wjsRs4AJ2njAyHc"
        },
        "office":{
            "formatted_address" : "Bhumkar Bridge, Wakad, Pune, Maharashtra 411057, India",
            "display_address" : "Bhumkar Bridge",
            "icon" : "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
            "location" : [ 
                73.7526237999999950,
                18.6059373000000010
            ],
            "placeId" : "ChIJ5-6NE3y5wjsR5Q4o_NfuSFU"
        },
        "preferredTimeHToO": "9:00 AM",
        "preferredTimeOToH": "6:00 PM",
        "routeSummary" : "Phase 2 Rd"
    }
}, function(){
    console.log('Finished populating Teams');
});

SeedData.seedLocations();