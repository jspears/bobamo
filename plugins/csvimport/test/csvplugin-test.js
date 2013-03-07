var CsvPlugin = require('../csvimport');

var plugin = new CsvPlugin();

module.exports.testReadHeaders = function (test) {
    plugin.readHeader('/test/data/test1.csv', function (err, headers) {
        console.log('headers', headers);
        test.equal(6, headers.length, "headers");
        test.done();
    });

}
module.exports.testMakeSchema = function (test) {

    plugin.readHeader('/test/data/test1.csv', function (err, headers) {
        var conf = plugin.makeConf(headers, {
            stuff:{
                schemaType:'Number'
            },
            meta:{
                type:'Object',
                subSchema:{
                    favorite:{
                        schemaType:'Date'
                    }
                }
            }
        }, require('../parsers'));
        console.log('conf', conf);
        test.equal(conf.length, 6, "headers");
        test.equal(conf[5].parser, 'Date');
        test.done();
    });

}