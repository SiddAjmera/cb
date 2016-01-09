'use strict';

var express = require('express');
var controller = require('./ride.controller');
var router = express.Router();
var auth = require('../../auth/auth.service');

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
// Routes created by Siddharth

// This can be used for any type of sigle get. This will only return a single Ride Object
router.post('/GetRideByRideAttribute', controller.getRideByRideAttribute);
router.post('/GetAvailableRides', controller.getAvailableRides);
router.post('/GetRideHistoryForCurrentUser', controller.getRideHistoryForCurrentUser);
router.post('/FilterRide', controller.filterRide);
// End of routes

router.put('/:id', controller.update);
router.put('/AddCompanionToRide/:id', controller.addCompanionToRide);

router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;