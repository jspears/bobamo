var gen = require('../genschema'), fs = require('fs'), bobamo = require('../../../index'), Model = bobamo.DisplayModel,
    should = require('should');
var m = JSON.parse(fs.readFileSync(__dirname+'/data/schema.json'))



var model = new Model("Exception", [m]);

var models = {};


module.exports.testModelToSchema = function (test) {
    var oas = should.Assertion.prototype.assert;
    should.Assertion.prototype.assert = function(expr, msg, negatedMsg, expected, showDiff){
        try {
             oas.apply(this, arguments);
            test.ok(true, expected);
        }catch(e){
            test.fail(negatedMsg);
        }
    }
    var json = gen.modelToSchema(model, models);
    models.should.have.property('Note')
    models.Note.properties.should.have.property('addDt').obj.should.have.property('type', 'Date');

    json.should.have.property('$schema', "http://json-schema.org/draft-04/schema#")
    json.should.have.property('type', 'object')
    json.properties.deep.should.have.property('properties')
        .obj.should.have.property('superdeep')
        .obj.should.have.property("type", "string")

    json.properties.should.have.property('notes');
    json.properties.notes.should.not.have.property('properties');
    json.properties.notes.should.have.property('type', 'array');
    json.properties.notes.items.should.have.property('$ref', 'Note');
    json.properties.enm.should.have.property('enum');

    var valid = {
        schema:{
            "valid":{
                "schemaType":"Number",
                "validators":[
                    {
                        "type":"required",
                        "message":""
                    },
                    {
                        "type":"min",
                        "min":1
                    },
                    {
                        "type":"max",
                        "max":10
                    }

                ]
            }
        }
    }
    var validSchema = gen.modelToSchema(new Model('Valid', [valid]));
    validSchema.properties.valid.should.have.property('minimum', 1);
    validSchema.properties.valid.should.have.property('maximum', 10);
    validSchema.required.should.include('valid');


    var LoanPoolSummary = {
        loan:{
            modelName:'LoadStat',
            subSchema:{
                amount:'Number',
                count:'Number'
            }
        },
        pool:{
            modelName:"PoolStat",
            subSchema:{
                amount:'Number',
                count:'Number'
            }
        }

    }
    var LoanPoolStateSummary = {
        requested:{
            subSchema:LoanPoolSummary
        },
        ready:{
            subSchema:LoanPoolSummary
        },
        approved:{
            subSchema:LoanPoolSummary
        },
        funded:{
            subSchema:LoanPoolSummary
        }
    }
    var m = {};
    var dashSchema = gen.modelToSchema(new Model('Dashboard', [
        {
            modelName:'LenderStatusSummary',
            schema:{
                loans:{
                    type:'List',
                    subSchema:{
                        lenderName:'Text',
                        lenderId:'Text',
                        wireId:'Text',
                        status:{
                            type:'NestedModel',
//                            modelName:"LoanPoolStateSummary",
                            subSchema:LoanPoolStateSummary
                        }
                    }
                }

            }
        }
    ]),  m);
    dashSchema.properties.loans.should.have.property('type', 'array')
    dashSchema.properties.loans.items.should.have.property('$ref', 'DashboardLoans');
    test.assert
    test.done();
}