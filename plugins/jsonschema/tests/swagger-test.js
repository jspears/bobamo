var Model = require('../../../lib/display-model'), M=require('../../mongoose/mongoose-model'), swagger = require('../swagger'), user = require('../../../examples/model/user');

var dm = new Model('User', [new M(user)], false);

console.log('finders', dm.finders);