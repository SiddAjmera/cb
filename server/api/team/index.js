'use strict';

var express = require('express');
var controller = require('./team.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/TeamsOfUser', auth.isAuthenticated(), controller.teamsOfUser);
router.get('/:id', auth.isAuthenticated(), controller.show);

router.post('/', auth.isAuthenticated(), controller.create);

router.post('/AddMember/:id', auth.isAuthenticated(), controller.addMember);
router.post('/UpdateMemberStatus/:id', auth.isAuthenticated(), controller.updateMemberStatus);

router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;