/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Vehicle = require('./vehicle.model');

exports.register = function(socket) {
  Vehicle.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Vehicle.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('vehicle:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('vehicle:remove', doc);
}