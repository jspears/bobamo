var gen = require('../genschema'), fs = require('fs'), bobamo = require('../../../index'), Model = bobamo.DisplayModel, should = require('should');
var m = JSON.parse(fs.readFileSync('./schema.json'))
var model = new Model("Exception", [m]);
//(m, depends, pluginManager, models)
//console.log('model', JSON.stringify(model,null,3));
var models = {};
var json = gen.modelToSchema(model, null, null, models);
console.log('models', JSON.stringify(models, null, 3));
console.log('json', JSON.stringify(json, null, 3));

models.should.have.property('Note')
models.Note.properties.should.have.property('addDt').obj.should.have.property('type', 'Date');

json.should.have.property('$schema', "http://json-schema.org/draft-04/schema#")
json.should.have.property('type', 'object')
json.properties.deep.should.have.property('properties')
    .obj.should.have.property('superdeep')
    .obj.should.have.property("type", "string")

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
console.log('validSchema', validSchema);
validSchema.required.should.include('valid');
process.exit(0);