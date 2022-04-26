'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var userSchema = Schema( {
  name: String,
  price: Number,
  category: String,
  date: Date
} );

module.exports = mongoose.model( 'User', userSchema );