var should = require('should'), mongoose = require('mongoose'),  App = require('../lib/display-model'), ma = require('../lib/mongoose-adapter')(mongoose),  User = require('../examples/model/user'),
    Group = require('../examples/model/group'),
    Empl  = require('../examples/model/employee');


describe('mongoose-adapter', function(){
    it('should work', function(done){
        ma.should.have.property('modelPaths');
        ma.modelPaths.should.have.property('user');
        ma.modelPaths.should.have.property('group');
        ma.modelPaths.should.have.property('employee');
        ma.modelPaths.user.should.have.property('title', 'User');
        ma.modelPaths.user.should.have.property('modelName', 'user');
        ma.modelPaths.user.should.have.property('plural', 'Users');
        ma.modelPaths.user.should.have.property('paths');
        ma.modelPaths.user.paths.should.have.property('username');
        ma.modelPaths.user.paths.username.should.have.property('dataType', 'String')
        ma.modelPaths.user.paths.should.have.property('password');
        ma.modelPaths.user.paths.password.should.have.property('dataType', 'Password')
        ma.modelPaths.user.paths.groups.should.have.property('dataType', 'Array')
        ma.modelPaths.user.paths.groups.should.have.property('url')
        done();
    });
    it('should work as an App', function(done){
        ma = new App(ma);
        ma.should.have.property('modelPaths');
        ma.modelPaths.should.have.property('user');
        ma.modelPaths.should.have.property('group');
        ma.modelPaths.should.have.property('employee');
        ma.modelPaths.user.should.have.property('title', 'User');
        ma.modelPaths.user.should.have.property('modelName', 'user');
        ma.modelPaths.user.should.have.property('plural', 'Users');
        ma.modelPaths.user.should.have.property('paths');
        ma.modelPaths.user.paths.should.have.property('username');
        ma.modelPaths.user.paths.username.should.have.property('dataType', 'String')
        ma.modelPaths.user.paths.should.have.property('password');
        ma.modelPaths.user.paths.password.should.have.property('dataType', 'Password')
        ma.modelPaths.user.paths.groups.should.have.property('dataType', 'Array')
        ma.modelPaths.user.paths.groups.should.have.property('url')
        done();
    });
    it('should work as an App', function(done){
        ma = new App({modelPaths:{junk:{}}},ma);
        ma.should.have.property('modelPaths');
        ma.modelPaths.should.have.property('junk');
        ma.modelPaths.junk.should.have.property('title', 'Junk');
        ma.modelPaths.should.have.property('user');
        ma.modelPaths.should.have.property('group');
        ma.modelPaths.should.have.property('employee');
        ma.modelPaths.user.should.have.property('title', 'User');
        ma.modelPaths.user.should.have.property('modelName', 'user');
        ma.modelPaths.user.should.have.property('plural', 'Users');
        ma.modelPaths.user.should.have.property('paths');
        ma.modelPaths.user.paths.should.have.property('username');
        ma.modelPaths.user.paths.username.should.have.property('dataType', 'String')
        ma.modelPaths.user.paths.should.have.property('password');
        ma.modelPaths.user.paths.password.should.have.property('dataType', 'Password')
        ma.modelPaths.user.paths.groups.should.have.property('dataType', 'Array')
        ma.modelPaths.user.paths.groups.should.have.property('url')
        done();
    });
})