var should = require('should'),
    App = require('../lib/display-model'),
    util = require('../lib/util'),
    mongoose = require('mongoose'),
    factory = require('../lib/display-factory')(mongoose),
    User = require('../examples/model/user'),
    Group = require('../examples/model/group'),
    Empl  = require('../examples/model/employee')

    ;


describe('Should Be Deep', function () {
    it('should return the first match', function (done) {
        var obj1 = {title:'hello', modelPaths:{m1:{modelName:'m1', title:'M1'}}};
        var obj2 = {modelPaths:{m1:{plural:'M1s'}}};
        var obj3 = {modelPaths:{m1:{ paths:{test:{title:'hello'}}}}}
        var obj4 = {modelPaths:{m1:{ paths:{test:{type:'String'}}}}}
        var obj5 = {modelPaths:{m2:{ paths:{test:{type:'String'}}}}}

            ;
        var app = new App(obj1, obj2, obj3,obj4,obj5);
        app.should.have.property('title', 'hello');
        app.modelPaths.m1.modelName.should.eql('m1');
        app.modelPaths.m1.plural.should.eql('M1s');
        app.modelPaths.m1.paths.test.title.should.eql('hello')
        app.modelPaths.m1.paths.test.type.should.eql('String')
        app.modelPaths.m2.paths.test.type.should.eql('String')
        util.depth(app, 'modelPaths.m1.paths.test.title', null, false).should.eql('hello')
        done();
    });
    it('should be nestable', function (done) {
        var obj1 = new App({title:'hello', modelPaths:{m1:{modelName:'m1', title:'M1'}}});
        var obj2 = new App(obj1, {modelPaths:{m1:{plural:'M1s'}}});
        var obj3 = new App(obj2, {modelPaths:{m1:{ paths:{test:{title:'hello'}}}}})
        var obj4 = new App(obj3, {modelPaths:{m1:{ paths:{test:{type:'String'}}}}});
        var app = new App(obj4, {modelPaths:{m2:{ paths:{test:{type:'String'}}}}});

        app.should.have.property('title', 'hello');
        app.modelPaths.m1.modelName.should.eql('m1');
        app.modelPaths.m1.plural.should.eql('M1s');
        app.modelPaths.m1.paths.test.title.should.eql('hello')
        app.modelPaths.m1.paths.test.type.should.eql('String')
        app.modelPaths.m2.paths.test.type.should.eql('String')
        app.modelPaths.m2.should.have.property('modelName','m2');
        util.depth(app, 'modelPaths.m1.paths.test.title', null, false).should.eql('hello')
        done();
    });
    it('should work with factory', function(done){
        var fap = factory.app();
        console.log('fap',fap)
        var app = new App(fap);
          console.log('app',app);
        done();

    });
});