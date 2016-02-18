'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);

// Routes created by Siddharth
router.post('/MyTeams', auth.isAuthenticated(), controller.teamsOfCurrentUser);
router.post('/GetSuggestions', auth.isAuthenticated(), controller.getSuggestions);
router.post('/GetUsers', auth.isAuthenticated(), controller.getUsers);
// End of Routes Created by Siddharth

router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.post('/', controller.create);

module.exports = router;
