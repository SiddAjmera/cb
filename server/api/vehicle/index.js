'use strict';

var express = require('express');
var controller = require('./vehicle.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);

router.post('/GetVehiclesByUserId', auth.isAuthenticated(), controller.getVehiclesByUserId);
router.post('/GetVehicleByVehicleId', auth.isAuthenticated(), controller.getVehicleByVehicleId);

router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;