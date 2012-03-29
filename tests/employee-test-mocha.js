var mongoose = require('mongoose');
var assert = require('assert');
var employee = require('../examples/model/employee');

before(function (done) {
    mongoose.connect("mongodb://localhost/bobamo_development");
//    var c = mongoose.connection;
//    c.db.dropDatabase(function () {
//        done();
//    });
  done();
});

describe('testing add user', function () {
    it('should create led zepplin', function (done) {
        var Employee = mongoose.model('employee');
        var e1 = new Employee({
            email:'jbonham@ledzepplin.com',
            firstName:'John',
            lastName:'Bonham',
            twitterId:'@jbonham',
            officePhone:'555-222-3333',
            cellPhone:'555-222-3334',
            description:'Awesome Drummer'
        });

        var e2 = new Employee({
            email:'jpage@ledzepplin.com',
            firstName:'James',
            lastName:'Page',
            twitterId:'@jpage',
            officePhone:'555-222-3333',
            cellPhone:'555-222-3334',
            description:'Awesome Guitarist'
        });

        var e3 = new Employee({
            email:'plant@ledzepplin.com',
            firstName:'Robert',
            lastName:'Plant',
            twitterId:'@plants',
            officePhone:'555-222-3333',
            cellPhone:'555-222-3334',
            description:'Awesome Singer'
        });

        var e4 = new Employee({
            email:'jpjones@ledzepplin.com',
            firstName:'John Paul',
            lastName:'Jones',
            twitterId:'@johnpauljohns',
            officePhone:'555-222-3333',
            cellPhone:'555-222-3334',
            description:'Awesome Basist/Keyboardist'
        });
        var _d = false;
        e1.save(function (err, obj) {
            assert.ifError(err);
            e2.save(function (err, obj) {
                assert.ifError(err);
                e3.save(function (err, obj) {
                    assert.ifError(err);
                    e4.reports = [e1, e2, e3];
                    e4.save(function (err, obj) {
                        assert.ifError(err);
                        console.log('all done');
                        if (!_d){
                            _d = true;
                            done();
                        }
                    });

                });

            });

        });


    });
});
