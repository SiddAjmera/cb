'use strict';

var express = require('express');
var controller = require('./ride.controller');
var router = express.Router();
var auth = require('../../auth/auth.service');

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/GetLatestActiveRide', auth.isAuthenticated(), controller.latestActiveRideOfUser);

router.post('/', auth.isAuthenticated(), controller.create);
router.post('/GetRideByRideAttribute', auth.isAuthenticated(), controller.getRideByRideAttribute);
router.post('/GetAvailableRides', auth.isAuthenticated(), controller.getAvailableRides);
router.post('/GetRideHistoryForCurrentUser', auth.isAuthenticated(), controller.getRideHistoryForCurrentUser);
router.post('/FilterRide', auth.isAuthenticated(), controller.filterRide);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.put('/AddCompanionToRide/:id', auth.isAuthenticated(), controller.addCompanionToRide);
router.put('/UpdateRiderStatus/:id', auth.isAuthenticated(), controller.updateRiderStatus);
router.put('/CancelRide/:id', auth.isAuthenticated(), controller.cancelRide);
router.put('/RescheduleRide/:id', auth.isAuthenticated(), controller.rescheduleRide);
// End of routes

router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

router.get('/:id', auth.isAuthenticated(), controller.show);

module.exports = router;