var gen = require('../genschema'), fs = require('fs'), bobamo = require('../../../index'), Model = bobamo.DisplayModel, should = require('should');
var NopeLoopSummary = {
    loan:{
        schemaType:"Object",
        type:"NestedModel",
        subSchema:{
            mount:{type:'Number'}
        }
    }
}

var NopeLoopStateSummary = {
    quest:{
        type:"NestedModel",
        schemaType:"Object",
        subSchema:NopeLoopSummary
    }
}

var StatusNopeLoopSummary = new Model('StatusNopeLoopSummary', [
    {
        schema:{
            forDt:{
                type:'Date'
            },
            status:{
                type:'List',
                subSchema:NopeLoopStateSummary
            }
        }
    }
])

module.exports.testDeepProperties = function (test) {
    var m2 = {};
    var slp = gen.modelToSchema(StatusNopeLoopSummary, m2);


    m2.should.have.property('StatusNopeLoopSummaryStatus');
    m2.StatusNopeLoopSummaryStatus.should.have.property('properties');
    m2.StatusNopeLoopSummaryStatus.properties.should.have.property('quest');
    m2.StatusNopeLoopSummaryStatus.properties.quest.should.have.property('properties');
    m2.StatusNopeLoopSummaryStatus.properties.quest.properties.should.have.property('loan')
            .obj.should.have.have.property('properties')
            .obj.should.have.property('mount')
            .obj.should.have.property('type', 'number')

        ;
    test.done();
}