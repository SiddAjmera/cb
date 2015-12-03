/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Ride = require('./ride.model');

exports.register = function(socket) {
  Ride.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Ride.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('ride:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('ride:remove', doc);
}