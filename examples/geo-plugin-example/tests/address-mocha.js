var mongoose = require('mongoose'), Address = require('../lib/geomodel'), assert = require('assert');

mongoose.connect('mongodb://localhost/geomodel_development');


new Address({
    street1:'1405 S Greenbrier St',
    city:'Arlington',
    state:'VA'
}).save(function(err, obj){
    assert.ifError(err);
    console.log('saved', obj);
    process.exit(0);
})