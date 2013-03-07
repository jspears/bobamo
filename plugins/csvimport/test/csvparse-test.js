var parsers = require('../parsers'),
    bobamo = require('../../../index'),
    Model = bobamo.DisplayModel
    csv = require('../csvparse');

function log() {
    console.log.apply(console, Array.prototype.slice.call(arguments, 0).map(function (v) {
        var t = typeof v;
        if (t == 'string' || t == 'number' || t == 'date')
            return v;
        return JSON.stringify(v, null, 3);
    }))

}
module.exports.testParse = function (test) {
    var d1 = new Date(1361935888443), d2 = new Date(1361935806642);
    var data = [
        ['a', '1' , ' b ', d1.toJSON(), 'xyz'],
        ['b', '2' , null, d2.toJSON(), 'xyz'],
        ['c', ' 3', ' b ', new Date(1361934915858).toJSON(), 'xyz'],
        ['d', '4' , ' c    ', d2.toJSON(), null],
        ['d', '4' , ' c    ', 'now', 'AAA', '2010-02-10', 'val']
    ];
    var conf = [
        {type:'String', property:'a', options:{uppercase:true}},
        {type:'Number', property:'b'},
        {type:'String', property:'c', options:{trim:true, defualtValue:'DEF'}},
        {type:'Date', property:'d', options:{}},
        {type:'Custom', property:'e', isAsync:true, parser:function (options) {
            return function (value,row,ci,ri, cb) {
                setTimeout(function onParserTimeout() {
                    try {
                        cb(null, value.toUpperCase());
                    } catch (e) {
                        cb(e);
                    }
                }, 200);
            }
        }},
        {type:'Date', property:'f', options:{format:'YY-MM-DD', defaultValue:'13-02-12'}}
    ]
    var ap = csv.setupParsers(conf, parsers);
    csv.parseToObject(data, ap, function (errors, objs) {
        console.log('objs', objs, errors);
        test.equal(4, objs.length,  'Correct count');
        var o1 = objs[0], o2 = objs[1];
        test.equal('A', o1.a, 'String toUppercase Test');
        test.equal(1, o1.b, 'toNumber Test');
        test.equal('b', o1.c, 'String trim Test');
        test.ok(o1.d instanceof Date, 'Made a date');
        test.equal(d1.toJSON(), o1.d.toJSON(),  'Date toDate Test');
       test.equal('2020-02-10T05:00:00.000Z', objs[3].f.toJSON(), "Test parsing")
       test.equal(1, errors.length, 'Got me an error ' + errors)
       test.equal("Cannot call method 'toUpperCase' of null", errors[0].message, 'Correct error')
        test.equal(5, errors[0].rowData.length, 'Correct error')
        test.done();
    });

}
//module.exports.testParsesFor = function (test) {
//    var arr = csv.parsersFor('str', );
//    //   log('str', arr);
//    test.equal(arr.length, 2, 'Should have 2');
//
//    test.done();
//}


var imodel = [
    {
        parser:'String',
        options:{
            lowercase:true,
            trim:true
        }
    },
    {
        property:'required',
        type:'String',
        options:{

        }
    }
]
var schema = {
    modelName:'Test',
    schema:{
        str:{
            type:'Text',
            schemaType:'String'
        },
        required:{
            type:'Text',
            validators:[
                {type:'required'}
            ],
            schemaType:'String'

        },
        numbr:{
            type:'Number'
        },
        option_arr:{
            type:'Select',
            options:['a', 'b', 'c'],
            schemaType:'String'

        },
        option_col:{
            type:'Select',
            collection:'test/collection',
            schemaType:'String'

        },
        date:{
            type:"Date"
        },
        split:{
            type:'List',
            schemaType:'Number'
        },
        ref:{
            type:'NestedModel',
            schemaType:'ObjectId',
            ref:'BType'
        },
        meta:{
            type:'NestedModel',
            schemaType:'Object',
            subSchema:{
                fun:'Number'
            }
        }
    }
}