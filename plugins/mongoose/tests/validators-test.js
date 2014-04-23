var validators = require('../public/js/validators'),   should = require('should');

/*
 console.log('message', t.min({min:2})(1));
 console.log('message', t.max({max:3})(4));
 console.log('message', t.enum({enum:['a', 'b', 'c']})('d'));
 console.log('message', t.minlength({minlength:2})("a"));
 console.log('message', t.maxlength({maxlength:3})("abcd"));

 */
var validator;
module.exports.setUp = function(next){
    validator = validators.inject();
        next();

};
module.exports.testMin = function(test){
    var func =validator.min({min:2});
    func(1).should.eql({
        type:'min',
        message: 'Must be more than 2'
    });
    test.ok( func(3) == null, 'Passed Validation');

    test.done();
}
module.exports.testMax = function(test){
    try {
        validator.max({});
        test.ok(false, 'Should throw an error');
    }catch(e){
        e.should.have.property('message', 'Missing required "field" for "max" validator')
    }
    var func =validator.max({max:2});
    func(3).should.eql({
        type:'max',
        message: 'Must be less than 2'
    });
    test.ok( func(1) == null, 'Passed Validation');


    test.done();
}
module.exports.testEnum = function(test){
    try {
        validator.enum({});
        test.ok(false, 'Should throw an error');
    }catch(e){
        e.should.have.property('message').eql('Missing required "field" options for "enum" validator')
    }
    var func =validator.enum({enum:['a','b','c']});
    func('d').should.eql({
        type:'enum',
        message: 'Must be an enumerated value: [a,b,c]'
    });
    test.ok( func('a') == null, 'Passed Validation');


    test.done();
}
module.exports.testMinLength = function(test){
    try {
        validator.minlength({});
        test.ok(false, 'Should throw an error');
    }catch(e){
        e.should.have.property('message', 'Missing required "field" for "minlength" validator')
    }
    var func =validator.minlength({minlength:2});
    func(' a').should.eql({
        type:'minlength',
        message:  'Must be at least 2 characters'
    });
    test.ok( func(' abc') == null, 'Passed Validation');


    test.done();
}
module.exports.testMaxLength = function(test){
    try {
        validator.maxlength({});
        test.ok(false, 'Should throw an error');
    }catch(e){
        e.should.have.property('message', 'Missing required "field" for "maxlength" validator')
    }
    var func =validator.maxlength({maxlength:2});
    func(' abc').should.eql({
        type:'maxlength',
        message:  'Must be less than 2 characters'
    });
    test.ok( func(' ab') == null, 'Passed Validation');


    test.done();
}
module.exports.testMatch = function(test){
    var func =validator.match({match:"junk"});
    func('test', {junk:'test2'}).should.eql({
        type:'match',
        message:'Does not match junk'
    });
    test.ok( func('ab', {junk:'ab'}) == null, 'Passed Validation');


    test.done();
}
module.exports.testRequired = function(test){
    var func =validator.required();
    func().should.eql({
        type:'required',
        message:'Required'
    });
    test.ok( func('ab') == null, 'Passed Validation');


    test.done();
}
module.exports.testMinitems = function(test){
    var func = validator.minitems({minitems:2})
    func([1]).should.eql({
        type:'minitems',
        message:  'Must have more than 2 items'
    })
    test.ok( func([1,2,3]) == null, 'Passed Validation');
    test.done();
}

module.exports.testMaxitems = function(test){
    var func = validator.maxitems({maxitems:2})
    func([1,2,3]).should.eql({
        type:'maxitems',
        message:  'Must have less than 2 items'
    })
    test.ok( func([1]) == null, 'Passed Validation');
    test.done();

    test.done();
}
module.exports.testRegexp = function(test){
    var func = validator.regexp({regexp:"^[a-z]*$"});
    func('abc0').should.eql({
        type:'regexp',
        message:'Must match "^[a-z]*$"'
    });
    test.ok( func('abc') == null, 'Passed Validation');


    test.done();
}