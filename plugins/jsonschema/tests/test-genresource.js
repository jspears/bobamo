var gen_resource = require('../genresource'), fs = require('fs'),
    bobamo = require('../../../index'),
    Model = bobamo.DisplayModel, should = require('should');

var model = {
    schema:{
        name:{
            type:"Text"
        }
    },
    allowedMethods:['addNote'],
    finders:[
        {
            addNote:{
                display:{
                    title:'Add a note to an exception first note becomes the "Owner"',
                    spec:{
                        httpMethod:'post'
                    },
                    schema:{
                        exceptionId:'Text',
                        note:'Text'
                    },
                    responseClass:'void'
                }
            }
        }
    ]
}
var m = new Model('GenResourceTest',[model], false);
/**
 * This is suppose to test the finder stuff.
 * @param test
 */
module.exports.testModelHasAllowed = function(test){
    var j = new Model('Junk',[{schema:{name:{type:'Text'}}, allowedMethods:['findOne']}], false);
    j.should.have.property('allowedMethods').eql(['findOne'])
    test.done();
}
module.exports.testModelShouldNotHaveAllowed = function(test){
    var j = new Model('Junk',[{schema:{name:{type:'Text'}}}], false);
    j.should.not.have.property('allowedMethods')
    test.done();
}
module.exports.testFinderPost = function (test) {

    var resource =  gen_resource.resourceFor(m, '/url', '0.1');
    resource.should.have.property('apis');

    var model = resource.should.have.property('models')
        .obj.should.have.property('GenResourceTestAddNote').obj;

    model.should.have.property('type', 'object')

    var prop = model.should.have.property('properties').obj;
    prop.should.have.property('exceptionId').obj.should.have.property('description', "Exception");
    resource.apis.should.have.length(1);
    resource.apis[0].should.have.property('path', "/GenResourceTest/addNote");

    test.done();
}