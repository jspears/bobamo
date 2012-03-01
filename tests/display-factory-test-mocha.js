var mongoose = require('mongoose'), Employee = require('../app/model/employee'), Group = require('../app/model/group'), User = require('../app/model/user'), should = require('should');

var factory = require('../app/lib/display-factory');

describe('Factory', function () {
    describe('Testing User', function () {

        it('should be awesome createFields', function (done) {
            var df = new  factory.DisplayFactory();
            var stuff = df.createFields(User);
            console.log(stuff);
            done()
        });
    });

});