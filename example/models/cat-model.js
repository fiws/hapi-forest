'use strict';

const mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.Oid },
  likes: [ String ],
  dislikes: [ String ],
  born: { type: Date },
  meta: {
    age: { type: Number },
    weight: { type: Number },
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cat', schema);
