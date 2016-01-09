'use strict';

var express = require('express');
var controller = require('./ride.controller');
var router = express.Router();
var auth = require('../../auth/auth.service');

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
// Routes created by Siddharth

// This can be used for any type of sigle get. This will only return a single Ride Object
router.post('/GetRideByRideAttribute', auth.isAuthenticated(), controller.getRideByRideAttribute);
router.post('/GetAvailableRides', auth.isAuthenticated(), controller.getAvailableRides);
router.post('/GetRideHistoryForCurrentUser', auth.isAuthenticated(), controller.getRideHistoryForCurrentUser);
router.post('/FilterRide', controller.filterRide);
// End of routes

router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;