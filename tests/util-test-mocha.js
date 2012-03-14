var util = require('../lib/util'), should = require('should');
describe('Testing Util', function () {

    describe('util.depth', function () {

        it('should return 1 - false', function (done) {
            var a = { b:{c:1}, d:false };
            util.depth(a, 'b.c', 2).should.eql(1);
            a.should.have.property('b');
            a.b.should.have.property('c', 1);
            done();
        });
        it('should return 1 - false', function (done) {
            var a = { b:{c:1}, d:false };
            util.depth(a, 'b.c', 2, false).should.eql(1);
            a.should.have.property('b');
            a.b.should.have.property('c', 1);
            done();
        });

        it('should return 1 - true', function (done) {
            var a = { b:{c:1}, d:false}
            util.depth(a, 'b.c', 2, true).should.eql(2);
            a.should.have.property('b');
            a.b.should.have.property('c', 2);
            done();
        });


        it('should return 1 false', function (done) {
            var a = { b:{c:1}, d:false}
            util.depth(a, 'b.c', 2, false).should.eql(1);
            a.should.have.property('b');
            a.b.should.have.property('c', 1);
            done();
        });

        it('should b.c return 2 true ', function (done) {
            var a = { b:{c:1}, d:false}
            util.depth(a, 'b.c', 2, true).should.eql(2);
            a.b.should.have.property('c', 2);
            done();
        });

        it('should return j 2 not-safe ', function (done) {
            var a = { b:{c:1}, d:false}
            util.depth(a, 'j', 2, false).should.eql(2);
            a.should.not.have.property('j');

            util.depth(a, 'j', 2, true).should.eql(2);
            a.should.have.property('j', 2);

            done();
        });
        it('should return j.k 2 ', function (done) {
            var a = { b:{c:1}, d:false}
            util.depth(a, 'j.k', 2).should.eql(2);
            a.should.not.have.property('j');
            done();
        });

        it('should be false not-safe', function (done) {
            var a = { b:{c:1}, d:false}
            util.depth(a, 'd', true).should.eql(false);
            a.should.have.property('d', false);
            done();
        });
        it('should be false not-safe', function (done) {
            var a = { b:{c:1}, d:false}
            util.depth(a, 'd', true, true).should.eql(true);
            a.should.have.property('d', true);
            done();
        });
        it('should return the value', function(done){
            var a = { b:{c:1}, d:false,e:1}
            util.depth(a,'d').should.eql(false);
            util.depth(a,'e').should.eql(1);
            util.depth(a,'b.c').should.eql(1);
            done();
        })
    })
    describe('util.options', function(){
        it('should return options', function(done){
            var a = {};
            util.options(a);
            a.should.not.have.property('options');
            done();
        })
        it('should return options', function(done){
            var a = {options:'a'};
            util.options(a).should.eql('a');
            a.should.have.property('options','a');
            done();
        })

    });
    describe('util.defaultOrSet', function(){
       it('should return the value', function(done){
           var a = {b:[1]};
           util.defaultOrSet(a, 'b', []).push(2);
           a.should.have.property('b').eql([1,2]);
           done();
       })

    });
    describe('util.defaultOrSet', function(){
        it('should create c', function(done){
            var a = {b:[1]};
            util.defaultOrSet(a, 'c', []).push(1);
            util.defaultOrSet(a, 'c', []).push(2);
            a.should.have.property('c').eql([1,2]);
            done();
        })

    });

});