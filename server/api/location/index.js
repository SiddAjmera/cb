'use strict';

var express = require('express');
var controller = require('./location.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);

router.post('/CreateOrUpdateLocation', auth.isAuthenticated(), controller.createOrUpdateLocation);
router.post('/FilterLocation', auth.isAuthenticated(), controller.filterLocation);
router.post('/DriveIdsByUser', auth.isAuthenticated(), controller.driveIdsByUser);

router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;