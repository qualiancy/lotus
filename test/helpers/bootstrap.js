global.chai = require('chai');
global.Should = chai.Should();

global.lotus= require('../..');

function req (name) {
  return process.env.APNAGENT_COV
    ? require('../../lib-cov/lotus/' + name)
    : require('../../lib/lotus/' + name);
}

global.__lotus = {

};
