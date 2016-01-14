'use strict';

var express = require('express');
var controller = require('./drive.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);

router.post('/FilterDrive', auth.isAuthenticated(), controller.filterDrive);
router.post('/ProcessData', auth.isAuthenticated(), controller.processData);
router.post('/LatestDriveId', auth.isAuthenticated(), controller.latestDriveId);

router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;