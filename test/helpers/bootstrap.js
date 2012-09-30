global.chai = require('chai');
global.Should = chai.Should();

var chaiSpies = require('chai-spies');
global.chai.use(chaiSpies);

global.lotus = require('../..');
