var maker = require('../makemarkdown'), _ = require('underscore');
module.exports.testParseCsv = function(test){

    maker.readCsv('/test/test.csv', function(err, resp){
        console.log('resp', JSON.stringify(resp,null, 4), err);
        test.done();
    })

}
var json = JSON.stringify;
module.exports.testCsvToModel = function(test){
    maker.readCsv('/test/test2.csv', function(err, resp){
        console.log('headers',  json(maker.toSchema(resp.headerMap, resp.headers),null,3));

        test.done();
    });
}
module.exports.parseMapCsv = function(test){
    maker.readCsv('/test/test3.csv', function(err, resp){
        if (err != null){
            test.ok(false, "Should not error "+err);

            test.done();
            return;
        }
        var map = {};
        _.each(resp.content,function(c){
           map[c._] = c.Epic;
        });
        maker.readCsv('/test/test4.csv', map, 'Epic', function(err, resp){
            test.ok(err == null, "Should not error");
            console.log(Object.keys(resp.content));
            test.done();
        })
    })

}
module.exports.testMakeheader = function(test){
    var _headers = 'abc defgh jklmnop'.split(' ');
    var header = maker.makeheader(_headers);
    console.log('header1\n', header);
    test.ok(header == "abc  defgh  jklmnop\n---  -----  -------", "Header with defaults");

    header = maker.makeheader(_headers, {'abc':'A', 'defgh':'Some'});
   // test.ok(header == " abc  Some  jklmnop\n---  -----  -------", "Header with map");
    console.log('header2\n', header);

    header = maker.makeheader(_headers, {'abc':'A', 'defgh':'Some'}, {'A':10});
//    test.ok(header == "A           Some  jklmnop\n----------  ----  -------", "Header with map, and lengthMap\n");
    console.log('header3\n', header);


    test.done();
}
module.exports.testMaketable = function(test){
    var _headers = 'abc def jklmnop'.split(' ');
    var content = [{
            abc:1,
            def:'something',
            jklmnop:'A very long string that should not be trunkated'
        },
        {
            abc:2,
            def:'something',
            jklmnop:'A very long string that should not be trunkated'
        }
    ]
    markdown = maker.maketable(_headers, null, {abc:15}, content)
    console.log('\n\markdown\n', markdown);
    var markdown = maker.maketable(_headers, null, null, content)
    console.log('\n\markdown\n', markdown);
    test.done();
}
module.exports.testRep = function(test){
    test.ok(maker.rep('a', 0) == 'a', "Testing repeat 0");
    test.ok(maker.rep('a', 3) == 'aaa', "Testing repeat 3");
    test.done();
}

module.exports.testCsvToMarkdown = function(test){

    maker.readCsv('/test/test1.csv', function(err, resp){
        console.log("\n\n"+maker.maketable(resp.headers, resp.headerMap, resp.content));
        test.done();
    })
}
module.exports.testCsvToHtml = function(test){

    maker.readCsv('/test/test1.csv', function(err, resp){
        console.log("\n\n"+maker.makehtml(resp.headers, resp.headerMap, resp.content));
        test.done();
    })
}

module.exports.testCsvToStoriesHtml = function(test){

    maker.readCsv('/test/test1.csv', function(err, resp){
        console.log("\n\n"+maker.makehtml(resp.headers, resp.headerMap, resp.content));
        test.done();
    })
}
