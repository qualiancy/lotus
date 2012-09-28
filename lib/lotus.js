/*!
 * Lotus
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Internal dependancies
 */

var Reader = require('./lotus/reader_dsl')
  , ReaderStream = require('./lotus/reader_stream')
  , Writer = require('./lotus/writer_dls')
  , WriterStream = require('./lutus/writer_stream');

/*!
 * Module version
 */

exports.version = '0.0.0';

/*!
 * Constructors
 */

exports.Reader = Reader;
exports.ReaderStream = ReaderStream;
exports.Writer = Writer;
exports.WriterStream = WriterStream;

/*!
 * Factories
 */

exports.reader = function () {
  return new Reader();
};

exports.createReaderStream = function () {
  return new ReaderStream();
};

exports.writer = function () {
  return new Writer();
};

exports.createWriterStream = function () {
  return new WriterStream();
};
