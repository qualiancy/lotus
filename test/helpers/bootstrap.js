global.chai = require('chai');
global.should = chai.should();

var chaiSpies = require('chai-spies');
global.chai.use(chaiSpies);

global.lotus = require('../..');
