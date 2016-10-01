'use strict';

const mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  nameLower: { type: String, unique: true, lowercase: true, required: true },
  email: { type: String, unique: true, lowercase: true },
  isAdmin: { type: Boolean, default: false },
  cats: { type: mongoose.Schema.Types.Oid, ref: 'Cat' },
  key: String,
  settings: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

schema.pre('validate', function(next){
  if (!this.nameLower) return next();
  this.nameLower = this.name.toLowerCase();
  next();
});

module.exports = mongoose.model('User', schema);
