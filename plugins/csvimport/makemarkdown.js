var fs = require('fs'),  csv = require('csv'),
    inflection = require('../../lib/inflection'), pslice = Array.prototype.slice;

var empty = 0;
var fixRe =  /[^a-zA-Z0-9#_-]/g;
function readCsv(file, map, key, callback) {
    var args = pslice.call(arguments, 0);
    callback = args.pop();
    file = args.shift();
    map = args.length ? args.shift() : false;
    key = args.length ? args.shift() : false;
    var doKeyMap = map && key;
    var header = [], epic = doKeyMap ? {} : [], headerMap = {};
    csv()
        .from.stream(typeof file == 'string' ? fs.createReadStream(__dirname + file) : file)
        .on('record',function (row, index) {
            if (index == 0){
                row.forEach(function(v,i){

                    var fixed_v = v=='#' ? 'number' : inflection.camelize(v.replace(fixRe, '_') || 'empty'+(empty++), true);
                    header[i] = fixed_v;
                    headerMap[fixed_v] = v;
                })
            }else {
                var out = {};
                var e;
                row.forEach(function (k, i) {
                    var kk = header[i];
                    if (doKeyMap && kk == key && map[k]) {
                        e = map[k]
                    }
                    out[kk] = k;
                });
                if (doKeyMap)
                    (epic[e] || (epic[e] = [])).push(out)
                else
                    epic.push(out);
            }

        }).on('end', function () {
            callback(null, {
                headers:header,
                content:epic,
                headerMap:headerMap
            })
            // console.log('epic', epic);
        }).on('error', callback);

}
function sortOn(epic, field) {
    field || '#';
    var onEachSort = function (k) {
        epic[k].sort(function (a, b) {
            var a1 = a[field].split('.'), b1 = b[field].split('.')
            var min = Math.min(a1.length, b1.length);
            while (min--) {
                var a1s = a1.shift(), b1s = b1.shift();
                if (a1s && b1s)
                    return parseInt(a1s) - parseInt(b1s);
                return isNaN(a1s) ? als : parseInt(a1s) || isNaN(b1s) ? b1s : parseInt(b1s);
            }

        })
    }
    keys(epic).forEach(onEachSort);
}

function keys(obj) {
    return Array.isArray(obj) ? obj.map(function (v, k) {
        return k
    }) : Object.keys(obj);
}
/**
 *
 * @param headers
 * @param {Object} [headerMap] map internal to nice
 * @param {Object} [headerLengthMap] map internal to length.
 * @return {String}
 */
function makeheader(headers, headerMap, headerLengthMap){
    var args = pslice.call(arguments);
    headers = _arg(args, []);
    headerMap = _arg(args, {});
    headerLengthMap = _arg(args, {});
    var labels = [];
    var lines  = [];
    var top = [];
     headers.forEach(function(k,i){
         var v = headers[i];
         var label = headerMap[v] || k;
         var length =  headerLengthMap[label] || (headerLengthMap[label] = label.length);
         //top.push(rep('-', length+2));
         labels.push(' '+pad(label, length)+' ');
         lines.push(rep('-', length+2));
     })

    var ret = [
        //'+'+top.join('+')+'+',
               '|'+labels.join('|')+'|',
               '|'+lines.join('|')+'|'
              ].join('\n');

    return ret;
}
/**
 * Returns either the default value put in or
 * @param {Array} args
 * @param [def] optional default
 * @param [method] optional method defaults to [].shift();
 * @return {*}
 * @private
 */
function _arg(args, def, method){
    method = method || 'shift'
    return (args.length ? args[method].call(args) : def ) || def;
}
/**
 * Makes a markdown table.
 *
 * @param {Array} headers  an array of header
 * @param {Object} [headerMap] a map of headers to titles or falsy;
 * @param {Object} [headerLengthMap] a map to length;
 * @param {Array} [content]
 * @return {String}
 */
function maketable(headers, headerMap, headerLengthMap, content){
    var args = pslice.call(arguments, 0);
    headers = _arg(args);
    content = _arg(args, [], 'pop');
    headerMap = _arg(args, {});
    headerLengthMap = _arg(args, {});
    var body = [];
    var size = headers.length-1;
    var header = makeheader(headers, headerMap, headerLengthMap);
    content.forEach(function(c){
        var line = [];
        headers.forEach(function(k,i){
            var v = ""+(c[k] || '');
            var length = headerLengthMap[headerMap[k] || k];
            if (i < size){
                var s =' '+pad(v, length)+' '
                line.push(s);
            }else
                line.push(' '+pad(v, Math.max(length, v.length))+' ');
        })
        body.push('|'+line.join('|')+'|');
    })
    return [header].concat(body).join('\n');
}

/**
 * Makes a markdown table.
 *
 * @param {Array} headers  an array of header
 * @param {Object} [headerMap] a map of headers to titles or falsy;
 * @param {Object} [headerLengthMap] a map to length;
 * @param {Array} [content]
 * @return {String}
 */
function makehtml(headers, headerMap, headerLengthMap, content){
    var args = pslice.call(arguments, 0);
    headers = _arg(args);
    content = _arg(args, [], 'pop');
    headerMap = _arg(args, {});
    headerLengthMap = _arg(args, {});
    var body = [];
    var size = headers.length-1;
    var header = "<table>\n\t<thead>\n<tr>"
    headers.forEach(function(h){
        var v = headerMap[h] || h;
        header+='<th>'+v+'</th>'
    });
    header+="</tr>\n</thead>\n\t<tbody>";
    content.forEach(function(c){
        var line = '<tr>'
        headers.forEach(function(k,i){
            var v = ""+(c[k] || '');
            line+='\t\t<td>'+v+'</td>'

        })
        line+='</tr>';
        body.push(line);
    })

    return header + body.join('\n')+"\t</tbody>\n</table>";
}

/**
 * Pad a string,number,etc
 * @param {String} str
 * @param {number} [length] if falsey returns str;
 * @param {String} [pad] optional defaults to ' '
 * @return {String}
 */

function pad(str, length, pad){
     pad = pad || ' '
     pad = ""+pad;
     str = ""+(str || pad || ' ');
    if (!length)
        return str;

    if (str.length == length)
        return str;
    if (str.length > length)
        return str.substring(0, length);

    return str + rep(pad, length - str.length);
}

function rep(str, count){
    var newstr = str;
    for(var i= 1;i<count;i++){
        newstr += str;
    }
    return newstr;
}
function toSchema(map, headers){
    var schema = {};
    Object.keys(map).forEach(function(k){
        var v = map[k];
        schema[k] = {
            title:v
        }
    })

    return {schema:schema, fields:headers};
}
function schemaToHeader(Model){
    var headerMap = {};
    var headers =[], schema = Model.schema;
    _.each( Model.list_fields, function(v,k){
        headers.push(JSON.stringify(schema[v].title || v));
    });
    return headers.join(',');
}

module.exports = {
    schemaToHeader:schemaToHeader,
    toSchema:toSchema,
    pad:pad,
    rep:rep,
    readCsv:readCsv,
    keys:keys
}
