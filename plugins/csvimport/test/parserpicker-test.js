var rjs = require('requirejs'), _ = require('underscore');
rjs.config({
    nodeRequire:require,
    paths:{
        csvimport:__dirname + '/../public'
    }
});
//provide a non ajax parsers;
rjs.define('csvimport/parserprovider', function () {
    return function(cb){
        cb(null, require('../parsers').map(function(v){ return _.omit(v, 'parsers') }));
    }
});
rjs.define('libs/util/inflection', function(){ return require('../../../lib/inflection')})
//only works in node, not in web browsers don't try it.
var picker = rjs('csvimport/parserpicker');
module.exports = {
    testParserPicker:function (test) {
        test.ok(picker != null, "got a picker");
        picker.parsers(function(err, parsers){
            test.equal(parsers.length, 6)
            test.done();

        });
    },
    testToSchema:function(test){
        var rows = [['#','#','my Fine Title','My Fine Title!','please_do_me', 'good'],[]];
       var schema = picker.toSchema(rows.concat());
        test.ok(schema != null, 'Got a schema');
        test.equal(schema.headers.length , rows[0].length, 'Correct # of headers')
        test.deepEqual(schema.headers, ['row','row1','myFineTitle','myFineTitle1', 'pleaseDoMe', 'good']);
        test.done();
    }
}