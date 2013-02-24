
0.4.1 / 2013-02-24 
==================

  * streams: fix bug preventing dsl in single codec reader/writer

0.4.0 / 2013-02-04 
==================

  * test: add tests for single encoder/decoder scenarios
  * streams: allow for single encoder/decoder scenarios
  * test: [reader_dsl] chai chainable length bugfix

0.3.1 / 2013-01-27 
==================

  * dsl(s): revert handle to private fn with bind

0.3.0 / 2013-01-27 
==================

  * readme: update package name
  * writer-dsl: [push] fix global leak causing overwriting of settings

0.2.0 / 2012-10-18 
==================

  * test for handle of normal buffer
  * reader handle converts node buffer to buffers collection

0.1.0 / 2012-10-03 
==================

  * add travis badge
  * update project description
  * updated examples, added basic example
  * bind handle to dsl constructor
  * Writer DSL integer byte writing + tests
  * integer reader comments
  * remove util, use node buf parsing for ints
  * add integer byte readiner to Reader
  * reader dsl test cleanup
  * add writer dsl tests
  * add basic writer dsl
  * test for reader dsl referenced length
  * initiate reader dsl tests
  * Reader dsl setup and take commands.
  * chai 1.3 support
  * finish basic implementation of writer stream + tests
  * add WriterStream implementation (untested)
  * add tests for reader stream
  * implement stream methods for reader stream
  * add chai spies to testing inventory
  * fix type in main export
  * reader stream checks for fn.handle
  * implement readerstream#write *untested*
  * tests don't need extra loading mechanism
  * example reflects actual exports
  * provide exports for all constructors
  * examples expect stream exports
  * renaming
  * empty stream and dsl constructors
  * add apn example
  * initial commit
