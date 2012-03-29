var should = require('should');


describe('Should read package.json', function(){

    it('should have stuff', function(done){
        var a = require('../lib/package-adapter');
        a.should.have.property('title', 'Bobamo')
        a.should.have.property('version');
        a.should.have.property('description')
        done();
    })
});
