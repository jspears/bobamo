var PluginApi = require('../../lib/plugin-api'),
    u = require('util'), maker = require('./makemarkdown'),
    inflection = require('../../lib/inflection'),
    _ = require('underscore'),
    Q = require('q'),
    fs = require('fs'),
    csv = require('csv'),
    parsers = require('./parsers'),
    pslice = Array.prototype.slice,
    csvparse = require('./csvparse')

    ;


var CsvPlugin = function () {
    //noinspection JSUnresolvedFunction
    PluginApi.apply(this, arguments);
    this.conf = {modelName: {}};
};

u.inherits(CsvPlugin, PluginApi);
CsvPlugin.prototype.appModel = function () {
    return {
        header: {
            'admin-menu': {
                'csvimport': {
                    label: 'Import CSV',
                    href: '#csvimport/views/import'

                },
                'csvexport': {
                    label: 'Export CSV',
                    href: '#csvimport/views/export'

                },
                'csvimport-model': {
                    label: 'Import CSV Model',
                    href: '#csvimport/views/import-model'
                }

            }
        }
    }
};

CsvPlugin.prototype.setupParsers = csvparse.setupParsers;
CsvPlugin.prototype.parseToObject = csvparse.parseToObject;

CsvPlugin.prototype.parsersFor = function (type, allParsers) {
    var parsers = [];
    if (!type)
        return parsers
    allParsers = allParsers || this.pluginManager.asList('parsers');

    type = type.schemaType || type.type || type;
    allParsers.forEach(function (p) {
        if (!p.types) {
            parsers.push(p);
        } else {
            var idx = p.types.indexOf(type);
            if (idx == 0)
                parsers.unshift(p);
            else if (idx > 0)
                parsers.push(p);
        }
    }, this);
    return parsers;

};
CsvPlugin.prototype.parsers = function () {

    return parsers;
};

CsvPlugin.prototype.genConf = function (modelName, headers, allParsers) {
    var schema = this.pluginManager.appModel.modelPaths[modelName].schema;
    allParsers = allParsers || this.pluginManager.asList('parsers');
    return Object.keys(schema).map(function (k, i) {
        var v = schema[k];
        var p = this.parsersFor(v, allParsers);
        p = p.length ? p.shift().type : 'String';

        return {
            colIndex: i,
            property: k,
            title: v.title,
            schemaType: v.schemaType || 'String',
            parser: p

        }
    }, this)
}

CsvPlugin.prototype.readHeader = function (file, callback) {
    var stream = typeof file == 'string' ? fs.createReadStream(__dirname + file) : file
    csv()
        .from.stream(stream)
        .on('record',function (row) {
            stream.destroy();
            this.end();
            callback(null, row)
        }).on('error', callback)
};
var fixRe = /[^a-zA-Z0-9#_-]/g;
function depth(property, schema) {
    if (!(property || schema))
        return schema;

    var prop = Array.isArray(property) ? property : property.trim().replace('.', '.subSchema.').split('.');
    var obj = schema;
    //noinspection StatementWithEmptyBodyJS
    while (prop.length && obj && (obj = obj[prop.shift()]));
    return obj
}

CsvPlugin.prototype.makeConf = function (headers, schema, allParsers) {
    var map = {};
    var fix = function (v) {
        if (v == '')
            v = 'empty';
        else if (v == '#')
            v = 'row';
        else
            v = inflection.camelize(v.replace(fixRe, ' '), true);
        if (map[v]) {
            return v + (map[v]++);
        } else {
            map[v] = 1;
        }
        return v;
    };

    return headers.map(function (v, i) {
        var prop = fix(v);
        var s = schema && (depth(v, schema) || depth(prop, schema));

        var parserType = 'String';
        var first = s && this.parsersFor(s, allParsers).shift();
        if (first)
            parserType = first.type;
        //        parserType = this.parsersFor(p.schemaType || p.type).shift();
        return {
            colIndex: i,
            title: v,
            parser: parserType,
            property: s ? s[prop] ? prop : null : prop
        };

    }, this);
};

function smartDeep(path, schema) {
    if (!(path || schema))
        return null;

    path = Array.isArray(path) ? path : path.split('.');
    var m = path.shift();
    if (!(m && schema[m]))
        return schema;

    var o = schema[m];
    if (o.ref)
        return smartDeep.call(this, path, this[o.ref].schema)
    if (o.subSchema)
        return smartDeep.call(this, path, o.subSchema);

    return smartDeep.call(this, path, o);
}

CsvPlugin.prototype.routes = function () {
    //noinspection JSUnresolvedVariable
    var pluginUrl = this.pluginUrl;
    //noinspection JSUnresolvedVariable
    var pluginManager = this.pluginManager;
    this.app.get(pluginUrl + '/admin/search/:modelName', function (req, res, next) {
        var m = pluginManager.appModel.modelPaths[req.params.modelName].schema;
        var q = req.query.q || '';
        var path = q.trim().split('.');
        var opath = path.concat();
        var o = smartDeep.call(pluginManager.appModel.modelPaths, path, m);
        //ok   so I am trying to find the part of the that may not have matched.
        // it and remove it from the paths....
        opath.splice(opath.length - (opath.length - path.length));
        var allParsers = pluginManager.asList('parsers');
        res.send({
            payload: Object.keys(o ? o : {}).map(function (k) {
                var v = o[k];
                if (!v)
                    return null;
                var p = opath.concat(k).join('.');
                var type = this.parsersFor(v, allParsers).shift() || {};
                return {
                    label: p,
                    val: p,
                    schemaType: v.schemaType,
                    type: type.type
                };
            }, this).filter(function (v) {
                    return v != null
                }), //.filter(last.test, last),
            status: 0
        })

    }.bind(this));
    function onConfigureFromFile(req, res) {
        var conf = req.params.configuration || req.body.configuration || 'Default'
        var file = req.files.file || req.files.import;
        var modelName = req.params.modelName || inflection.camelize(file.name.replace(/\.{0,7}$/, ''), false);
        var m = pluginManager.appModel.modelPaths[modelName];
        m = m && m.schema;
        var read = fs.createReadStream(file.path);
        this.readHeader(read, function (err, resp) {
            if (err) {
                console.log('error', err);
                return res.send({
                    status: 1,
                    errors: [
                        {import: 'Failed to import ' + err.message}
                    ]
                });
            }
            var mapping = this.makeConf(resp, m);
            res.send({
                status: 0,
                payload: {
                    mapping: mapping,
                    configuration: conf,
                    properties: m ? m : mapping.map(function (v) {
                        return {
                            type: 'Text',
                            schemaType: 'String',
                            title: v.title,
                            name: v.property
                        }
                    }),
                    modelName: modelName
                }
            })
        }.bind(this));

    }
    /**
     * this takes a modelName and a file and tries to generate everything.
     */
    this.app.post(pluginUrl + '/admin/configure/:modelName?/:configuration?', onConfigureFromFile.bind(this));

    this.app.get(pluginUrl + '/admin/configure/:modelName/:config?', function (req, res) {

        var modelName = req.params.modelName, config = req.params.config || 'Default', mn = this.conf.modelName || (this.conf.modelName = {});
        var schema = pluginManager.appModel.modelPaths[modelName];

        var mapping;
        if (mn[modelName] && mn[modelName][config]) {
            mapping = mn[modelName][config]
        } else {
            mapping = this.genConf(modelName);
        }
        return res.send({
            status: 0,
            payload: {
                configuration: config,
                mapping: mapping,
                properties: _.values(schema && schema.schema)
            }

        })


    }.bind(this));
    var saveConfig = function onSaveConfig(req, res) {
        var modelName = req.params.modelName, config = req.params.config || 'Default', mn = this.conf.modelName || (this.conf.modelName = {});
        var m = mn[modelName] || (mn[modelName] = {});
        m[config] = req.body.mapping;
        this.save(this.conf, function (e) {
            return e ? res.send({
                status:1,
                errors:[e.message]
            }) : res.send({
                status: 0
            });
        })
    }.bind(this);

    this.app.put(pluginUrl + '/admin/configure/:modelName/:config?', saveConfig);
    this.app.post(pluginUrl + '/admin/configure/:modelName/:config?', saveConfig);


    this.app.get(pluginUrl + '/admin/importmodel/label/:modelName', function (req, res) {
        var payload = [];
        var modelName = req.params.modelName, config = req.params.config || 'Default', mn = this.conf.modelName || (this.conf.modelName = {});

        payload.push.apply(payload, Object.keys(this.conf.modelName[modelName] || {}).map(function (v) {
            return {label: v, val: v};
        }));
        if (payload.length == 0)
            payload.push({label: "No Configurations"});

        res.send({
            status: 0,
            payload: payload
        });
    }.bind(this));
    //noinspection JSUnresolvedVariable
    this.app.get(pluginUrl + '/admin/importmodel/:modelName/:configure?', function (req, res) {
        var modelName = req.params.modelName || req.body.modelName;
        var label = req.params.configure || req.body.configure || 'Default';
        var conf = this.conf.modelName[modelName] && this.conf.modelName[modelName][label];
        if (conf)
            res.send({
                status: 0,
                payload: conf
            });
        else
            res.send({
                status: 1,
                errors: ['could not find ' + label + ' ' + modelName]
            });

    }.bind(this));

    this.app.delete(pluginUrl + '/admin/configure/:modelName/:configure', function (req, res) {
        var model = req.params.modelName, label = req.params.configure;
        var mn = this.conf.modelName;
        if (mn && mn[model]) {
            delete mn[model][label];
            return this.save(this.conf, function (e) {
                 res.send(e ? {status: 1, errors: [e]} : {
                    status: 0
                });
            });
        }
        return res.send({
            status: 1,
            errors: ['Could not find ' + model + ' with configuration ' + label]
        });


    }.bind(this));

    this.app.put(pluginUrl + '/admin/createmodel', function (req, res, next) {
        var mapping = req.body.mapping;
        delete req.body.mapping;
        mapping.forEach(function (v) {
            if (v.parser) {
                if (v.parser.parsers)
                    v.options = v.parser.parsers[v.parser.type];
                v.parser = v.parser.type;
            }
        });
        console.log('createmodel', JSON.stringify(mapping, null, 3));
        var modelName = req.body.modelName;
        var obj = this.conf.modelName || (this.conf.modelName = {});

        var ref = obj[modelName] || ( obj[modelName] = {});
        ref.Default = mapping;
        this.save(this.conf, function () {
            req.url = '/modeleditor/admin/backbone/' + modelName;
            console.log('saved ' + modelName);
            next();
        });

    }.bind(this));


    this.app.put(pluginUrl + '/admin/importmodel/:modelName/:configure?', function (req, res) {
        var modelName = req.params.modelName || req.body.modelName;
        var label = req.params.configure || req.body.configure || 'Default';
        var obj = this.conf.modelName || (this.conf.modelName = {});

        var ref = obj[modelName] || ( obj[modelName] = {});
        ref[label] = req.body.mapping;

        this.save(this.conf, function () {
            res.send({
                status: 0
            });
        });

    }.bind(this));

    this.app.get(pluginUrl + '/parsers', function (req, res) {
        res.send({
            status: 0,
            payload: pluginManager.asList('parsers')
        });
    }.bind(this));
    this.app.post(pluginUrl + '/export', function (req, res) {
        var modelName = req.body.modelName;
        var exportAs = req.body.fileName || req.body.modelName + ".csv";
        var Model = this.options.mongoose.model(modelName);
        var SM = pluginManager.appModel.modelPaths[modelName];
        var headers = SM.list_fields;
        Model.find({},
            function (er, arr) {
                res.setHeader("Content-Disposition", "attachment;filename=" + exportAs);
                res.cookie('csvimport/exported', exportAs);
                res.write(maker.schemaToHeader(SM) + "\n");
                _.each(arr, function (obj) {
                    res.write(_.map(headers,function (v, i) {
                        return obj[v] ? JSON.stringify(obj[v]) : ''
                    }).join(',') + "\n")
                });
                res.end()
            }.bind(this)
        )

    }.bind(this));

    this.app.post(pluginUrl + '/admin/import', function (req, res) {
        var modelName = req.body.modelName, m = this.conf.modelName[modelName], c = (m && m[req.body.configuration || 'Default']);
        if (!(m || c )) {
            return res.send({
                status: 1,
                errors: [
                    {modelName: 'Could not find config'}
                ]
            });
        }
        var conf = this.setupParsers(c, pluginManager.asList('parsers'));
        var skip = _.isUndefined(req.body.skip) ? 1 : req.body.skip;
        var MModel = this.options.mongoose.model(modelName);
        var _parseCsv = function () {
            csvparse.parseCsv(req.files.import.path, MModel, conf, skip, function (e, o) {
                 e ? res.send({
                        status: 1,
                        errors: [e.message || e]
                    }) : res.send({
                    status: 0,
                    payload: o
                });
            });
        }
        req.body.empty ? MModel.remove({}, _parseCsv) : _parseCsv();


    }.bind(this));

    //noinspection JSUnresolvedVariable
    PluginApi.prototype.routes.apply(this);
}

module.exports = CsvPlugin;

