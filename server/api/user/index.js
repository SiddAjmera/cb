'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/',controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);

// Routes created by Siddharth
router.post('/MyTeams', auth.isAuthenticated(), controller.teamsOfCurrentUser);
router.post('/GetSuggestions', auth.isAuthenticated(), controller.getSuggestions);
router.post('/SuggestionsTest', auth.isAuthenticated(), controller.suggestionsTest);
router.post('/GetUsers', auth.isAuthenticated(), controller.getUsers);
// End of Routes Created by Siddharth

router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

module.exports = router;
