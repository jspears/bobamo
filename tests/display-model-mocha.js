var should = require('should'), App = require('../lib/display-model'), util = require('../lib/util');


describe('Should Be Deep', function () {
    it('should return the first match', function (done) {
        var obj1 = {title:'hello', models:{m1:{modelName:'m1', title:'M1'}}};
        var obj2 = {models:{m1:{plural:'M1s'}}};
        var obj3 = {models:{m1:{ paths:{test:{title:'hello'}}}}}
        var obj4 = {models:{m1:{ paths:{test:{type:'String'}}}}}
        var obj5 = {models:{m2:{ paths:{test:{type:'String'}}}}}

            ;
        var app = new App(obj1, obj2, obj3,obj4,obj5);
        console.log('app',app)
        app.should.have.property('title', 'hello');
        app.modelPaths.m1.modelName.should.eql('m1');
        app.modelPaths.m1.plural.should.eql('M1s');
        app.modelPaths.m1.paths.test.title.should.eql('hello')
        app.modelPaths.m1.paths.test.type.should.eql('String')
        app.modelPaths.m2.paths.test.type.should.eql('String')
        util.depth(app, 'modelPaths.m1.paths.test.title', null, false).should.eql('hello')
        done();
    });


});