'use strict';

var express = require('express');
var controller = require('./location.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);

router.post('/CreateOrUpdateLocation', controller.createOrUpdateLocation);
router.post('/FilterLocation', controller.filterLocation);

router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;