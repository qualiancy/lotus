/*!
 * Lotus
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Internal dependancies
 */

var DecoderDSL = require('./lotus/decoder-dsl')
//  , ReaderStream = require('./lotus/reader_stream')
  , EncoderDSL = require('./lotus/encoder-dsl')
  , Encoder = require('./lotus/encoder');

/*!
 * Module version
 */

exports.version = '0.4.1';

/*!
 * Constructors
 */

exports.DecoderDSL = DecoderDSL;
//exports.ReaderStream = ReaderStream;
exports.EncoderDSL = EncoderDSL;
exports.Encoder = Encoder;

/*!
 * Factories
 */

exports.decode = function () {
  return new DecoderDSL();
};

/*
exports.createReaderStream = function () {
  return new ReaderStream();
};

*/
exports.encode = function () {
  return new EncoderDSL();
};

exports.createEncoder = function () {
  return new Encoder();
};
