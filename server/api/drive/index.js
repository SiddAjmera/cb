'use strict';

var express = require('express');
var controller = require('./drive.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);

router.post('/FilterDrive', controller.filterDrive);
router.post('/ProcessData', controller.processData);
router.post('/LatestDriveId', controller.latestDriveId);

router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;