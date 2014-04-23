var gen = require('../genschema'), fs = require('fs'), bobamo = require('../../../index'), Model = bobamo.DisplayModel, should = require('should');
var NestedSummary = {
    schemaType:"Object",
    type:"NestedModel",
    modelName:'Summary',
    subSchema:{
        number:{
            type:'Number'
        }
    }
};


var StateSummary = {
    requested:{
        type:"NestedModel",
        schemaType:"Object",
        subSchema:{
            nope:NestedSummary,
            loop:NestedSummary
        }
    }
}
var models = {};
var m = new Model('test', [
    {schema:StateSummary}
]);
module.exports.testModelToSchemaWithInlineModels = function (test) {
    var slp = gen.modelToSchema(m, models);
    models.should.have.property('Summary')
        .obj.should.have.property('properties')
        .obj.should.have.property('number')
        .obj.should.have.property('type', 'number');

    slp.should.have.property('properties')
        .obj.should.have.property('requested')
        .obj.should.have.property('properties')
        .obj.should.have.property('nope')
        .obj.should.have.property('type', 'Summary')

    if (test.done)
        test.done();
    else
        process.exit();
}