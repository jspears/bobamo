var mongoose = require('mongoose'), Employee = require('../app/model/employee'), Group = require('../app/model/group'), User = require('../app/model/user'), should = require('should');

var factory = require('../app/lib/display-factory');

describe('Factory', function () {
    describe('Testing User', function () {

        it('should be awesome at creating fields', function (done) {
            var df = new  factory.DisplayFactory();
            var stuff = df.createFields(User);
            console.log(df.UIModel);
            stuff.should.have.property('username');
            stuff.username.should.have.property('validator').eql(['required'])
            stuff.should.have.property('twitter');
            stuff.twitter.should.have.property('validator').with.lengthOf(2);
            stuff.should.have.property('created_by');
            stuff.created_by.should.have.property('label', 'Created By');
            stuff.should.have.property('password');
            stuff.password.should.have.property('dataType', 'String');
            stuff.should.not.have.property('_password');
            stuff.should.not.have.property('created_at');
            done()
        });
    });

});