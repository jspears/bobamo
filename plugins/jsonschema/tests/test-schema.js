var conf = require('./bobamo.json');
var JsonSchemaPlugin = require('../jsonschema');
var Model = require('../../../lib/display-model');
var j = new JsonSchemaPlugin();
var m = new Model('Test', {schema:conf.plugins.modeleditor.modelPaths.Test}).schemaFor();
var s = j.modelToSchema(m);
//console.log(JSON.stringify(j.modelToSchema(m), null, '\t'));

