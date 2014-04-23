var _ = require('underscore'), Q = require('q'), pslice = Array.prototype.slice, csv = require('csv'), fs = require('fs');
/**
 * req.files.import.path
 * @param path req.files.import.path -- path to parse
 * @param MModel this.options.mongoose.model(modelName) -- mongoose model;
 * @param c this.setupParsers(conf) -- setup parsers
 * @param skip req.body.skip - Number of rows to skip
 * @param done
 */
function parseCsv(path, MModel, conf, skip, done) {
    var count = 0;
    var all = []

    function savePerRow(e, o) {
        var d = Q.defer();
        all.push(d);
        if (e)
            return d.reject(e);
        new MModel(o).save(d.makeNodeResolver());
        count++;

    }

    csv().from.stream(fs.createReadStream(path))
        .on('record', function onRecordCsvParse(record) {
        if (skip-- > 0)
            return;
        this.parseRowToObject(record, count, conf, savePerRow)
    }.bind(this)).on('end', function onEndCsvParse() {
            Q.all(all).done(function(e,o){
                done(null, {
                    length:count
                });
            });
    })
}
/**
 * This sets up the parsers.   If you are doing batch
 * only set them up once.   This is to allow parsers that require
 * keep state (i.e. increment) to properly keep count.  If called
 * multiple times, then the scope will be wrong;
 * This will return a sparse array if there are columns that are not being imported, not
 * to worry this is by design.   Or worry it is by design.
 *
 * @param {Array} conf
 * @return {Array[Function]} returns an array of functions to be used for parsing.
 */
function setupParsers(conf, allParsers) {
    allParsers = allParsers || this.pluginManager.asList('parsers');
    var parsers = [];
    return conf.map(function (v, k) {
        var c = _.extend({type:'String'}, v);
        var p = _.findWhere(allParsers, {type:c.type}) || c;
        var func = (_.isFunction(c.parser) || p.parser).call(p, _.extend({}, p.options, c.options));
        //always check for colindex  its important.
        var f = c.isAsync ? function onAsyncWrapper() {
            var args = pslice.call(arguments);
            var cb = args.pop();
            args.push(function onAsyncWrapperCallback(e, o) {
                if (e) return cb(e);
                //TODO - make this check the schema to determine wether it should make an object or an array.
                //  so if a property has a '.' in it will try and do the right thing.
                this[c.property] = o;
                cb(null, o);
            }.bind(this));
            func.apply(this, args)

        } : function onSyncWrapper() {
            var args = pslice.call(arguments);
            var cb = args.pop();
            try {
                var val = func.apply(this, args);
                this[c.property] = val;
                cb(null, val);
            } catch (e) {
                cb(e);
            }
        }
        return f;
    }, this);

}

function parseRowToObject(row, ri, parsers, savePerRow) {
    var obj = {};
    return Q.all(
        parsers.map(function onQAllParsersMap(func, ci) {
            if (!func)
                return;
            var d = Q.defer();
            func.call(obj, row[ci], row, ci, ri, d.makeNodeResolver());
            return d.promise;

        }).filter(function (v) {
                //this needs to happen after the map, so that we can properly handle
                // sparse arrays.   Otherwise the index (ci) will be wrong.
                return v;
            })
    ).then(function () {
            savePerRow(null, obj);
        }).fail(function (e) {
            e.rowData = row;
            e.rowIndex = ri;
            savePerRow(e)
        });
}
/**
 * This does the meat of the parsing,  use
 * @param rows [[]] 2 dimensional array of rows data
 * @param conf {Array} of parser function pass in the results of setupParsers(conf);
 * @param callback {Function} called when allrows haven been procesed first arg are the errors [err]
 * @param savePerRow {Function} called per row
 * @param parsers [{Array}] of parser functions.  Optional
 */
function parseToObject(rows, parsers, callback, savePerRow) {
    savePerRow = savePerRow || (function (oc) {
        var errors = [], objs = [];
        callback = function () {

            oc(errors.length ? errors : null, objs)
        }
        return function (e, o) {
            if (e)
                return errors.push(e);
            return objs.push(o);
        }
    })(callback);

    return Q.all(rows.map(function (row, ri) {
        return this.parseRowToObject(row, ri, parsers, savePerRow)
    }, this)).then(callback).fail(callback);
}

module.exports = {
    setupParsers:setupParsers,
    parseToObject:parseToObject,
    parseRowToObject:parseRowToObject,
    parseCsv:parseCsv
}
