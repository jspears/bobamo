if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(['underscore', 'csvimport/parserprovider', 'libs/util/inflection'], function(_, parsers, inflection){
    var fixRe = /[^a-zA-Z0-9\$]/g;
    return {
        parsers:parsers,
        parsersFor:function(type, cb){

            this.parsers.filter(function(v){
                return (!(v.types == null || ~v.types.indexOf(type)));
            });
        },
        toSchema:function(rows, callback){
            var map = {};
            var fix = function(v){
                if (map[v]){
                    return v+(map[v]++)
                }else{
                    map[v] = 1;
                }
                return v;
            }
            var orig = rows.shift();
            var headers = _.map(orig, function(v){
                if (v == '#'){
                    return fix('row');
                }else
                    return fix(inflection.camelize(v.replace(fixRe,' '), true));
            }, this);
            var schema = {};
            _.each(headers, function(v,i){
                schema[v] = {
                    title:orig[i],
                    name:v,
                    schemaType:'String',
                    type:'Text'
                }
            });
            return {
                headers:headers,
                schema:schema
            }
        }
    }

});