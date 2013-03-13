var bobamo = require('../../index'), util = require('util'), bu = require('../../lib/util'),
    PluginApi = bobamo.PluginApi, _ = require('underscore'), Model = bobamo.DisplayModel;


var RendererPlugin = function () {
    PluginApi.apply(this, arguments);
    this.conf = {};
    var self = this;
    Model.prototype.renderer = function (property, view) {
        var s = _.each(this[view || 'list_fields'], function (v) {
            if (v.name == property)
                return v;
        });
        s = s || (function (schema) {

            var ret = self.determineRenderer(schema, property);
            return _.extend({renderer: ret.name}, ret.defaults);
        })(this.schema);
        return _.extend({}, s, {property: property});
    };
};

util.inherits(RendererPlugin, PluginApi);
RendererPlugin.prototype.appModel = function () {
    return {
        modelPaths: {},
        header: {
            'admin-menu': {
                'renderer': {
                    label: 'Configure Renderers',
                    href: '#views/renderer/admin/list'
                }
            }
        }
    }
};

RendererPlugin.prototype.configure = function (conf) {
    Object.keys(this.conf).forEach(function (k) {
        delete this.conf[k];
    }, this);
    _.extend(this.conf, conf);
}
/**
 * Looks at the schema and tries to guess the best renderer for said renderer.
 * Similar to how editors/formatters work.
 * @param schema
 * @param property
 * @returns {*}
 */
function score(types, obj, v, t, i) {
    if (v.name == obj.type) return t * t * t * t; //ie. type == password than renderer == password.
    if (v.name == obj.schemaType) return t * t * t;
    if (!types)
        return 1;
    var tidx = types.indexOf(obj.type);
    var sidx = types.indexOf(obj.schemaType);
    if (~tidx && ~sidx) {
        //schemaTypes should score lower...
        return tidx + sidx + (t - i ) * t;
    } else if (~tidx) {
        return Math.max(tidx + t - i, 2) * t;
    } else if (~sidx) {
        return Math.max(sidx + (t - i), 1) * t;
    }
    return 0;
}
RendererPlugin.prototype.determineRenderer = function (schema, property) {
    var prop = Array.isArray(property) ? property.concat() : property.split('.');
    var obj = schema;
    while ((obj = obj[prop.shift()] )&& prop.length  && obj.subSchema && (obj = obj.subSchema));
 //   obj = obj[prop.shift()];
    if (obj.renderer) {
        return this.find(obj.renderer);
    }
    var order = [];
    var renderers = this.pluginManager.asList('renderers');
    var t = renderers.length;

    _.each(renderers, function (v, i) {

        order.push([score(v.types, obj, v, t, i), v]);
    })
    var first = order.sort(function (a, b) {
        return  a[0] - b[0];
    }).pop();
    return first.pop() || {renderer: 'default'};

}
var splitRe = /[\.\/]/;
RendererPlugin.prototype.rendererFor = function (type, name) {
    if (!name) {
        var s = type.split(splitRe);
        type = s[0], name = s[1];
    } else {
        s = [type, name];
    }
    var _id = s.join('.');

    var renders = this.pluginManager.exec(type, 'renderers');
    var first = _.first(_.where(renders, {name: name})) || _.first(_.where(renders, {_id: _id}))
    if (!first) {
        console.warn('no renderer matching [' + type + ']', name, _id);
        return;
    }
    var conf = this.conf[s.join('.')];
    if (conf) {
        first.defaults = conf.defaults;
    }


    return first;
}

var re = /^renderer[\/\.]/;
var renderers = require('./renderers');

RendererPlugin.prototype.renderers = function () {
    return renderers;
}

RendererPlugin.prototype.find = function (id) {
    var renderers = this.listRenderers();
    for(var i= 0,l=renderers.length;i<l;i++)
        if (renderers[i]._id == id) return renderers[i];
    console.log('did not find ', id);
    return null;
}
RendererPlugin.prototype.listRenderers = function () {
    var all = [], keys = [], refs = [];
    var allRenderers = this.pluginManager.asList('renderers');
    this.pluginManager.forEach(function (plugin) {
        var renderers = Array.isArray(plugin.renderers) ? plugin.renderers : _.isFunction(plugin.renderers) ? plugin.renderers() : null;
        if (!renderers)
            return
         renderers.forEach(function (v, i) {
            var id = v._id = plugin.name + '.' + v.name;
            if (v.ref)
                refs.push(v);
            keys.push(id);
            var ref = this.conf[id];
            if (ref && ref.defaults)
                v.defaults = ref.defaults;
            all.push(v);
        }, this);

    }, this);

    _.without(Object.keys(this.conf), keys).concat(refs).forEach(function (k) {

        var vv = _.isString(k) ? this.conf[k] : k;
        var ret = {};
        if (vv.ref) {
            var ref = vv;
            while (ref && ref.ref && ref.ref !== k) {
                ref = this.rendererFor(ref.ref)
            }
            if (!ref)
                return;
            ret = _.extend({}, ref, vv);
        }
        ret._id = 'renderer.' + vv.name
        all.push(ret);
    }, this);

    return all;
}
RendererPlugin.prototype.routes = function () {
    //noinspection JSUnresolvedVariable
    var pluginUrl = this.pluginUrl;
    //noinspection JSUnresolvedVariable
    var generate = this.generate;
    var save = function (req, res, next) {
        console.log('post', req.body);
        var _id = req.body._id;
        delete req.body._id;
        this.conf[_id] = {};
        this.save(this.conf, function () {
            res.send({
                status: 0
            });
        });

    }.bind(this);
    this.app.get(pluginUrl + '/views/admin/:type/:view.:format?', function (req, res, next) {
        //  var schema = this.rendererFor(req.params.renderer);
        var id = req.params.type;
        var schema = this.find(id);
        res.locals.model = new Model(req.params.type, schema);
        generate.call(this, res, 'admin/' + req.params.view + '.' + req.params.format)
    }.bind(this));
    this.app.get(pluginUrl + '/admin/renderer', function (req, res, next) {
        res.send({
            status: 0,
            payload: this.listRenderers()
        })
    }.bind(this));
    this.app.put(pluginUrl + '/admin/renderer/:id/:name', function (req, res, next) {
        delete req.body.status;
        delete req.body._id;
        var key = 'renderer/' + req.params.name
        this.conf[key] = {
            ref: req.params.id,
            defaults: req.body.defaults,
            name: req.params.name
        }
        this.save(this.conf, function () {
            res.send({
                status: 0,
                payload: {id: req.params.id, title: key}

            })
        })
    }.bind(this));
    this.app.put(pluginUrl + '/admin/renderer/:id', function (req, res, next) {
        var key = req.params.id;

        (this.conf[key] || (this.conf[key] = {})).defaults = req.body.defaults;
        this.save(this.conf, function () {
            res.send({
                status: 0,
                payload: {id: key, title: key}
            })
        }.bind(this))
    }.bind(this));

    this.app.put(pluginUrl + '/admin/renderer', save);
    this.app.get(pluginUrl + '/renderers', function (req, res, next) {
        res.send({
            status: 0,
            payload: this.listRenderers().map(function (v) {
                return _.omit(v, 'schema')
            })

        })
    }.bind(this));
    this.app.get(pluginUrl + '/admin/renderer/:id', function (req, res, next) {
        var id = req.params.id;
        var conf = this.conf[id];
        if (!conf) {
            var found = this.find(id);
            conf = found.defaults;
        }
        if (conf)
            res.send({
                status: 0,
                payload: conf && conf.defaults || {}

            })
        else
            res.send({
                status: 1,
                errors: [
                    { 'id': 'No renderer found for [' + id + ']'}
                ]
            })
    }.bind(this));
    this.app.get(pluginUrl + '/:type.:format?', function (req, res, next) {
        //  var schema = this.rendererFor(req.params.renderer);
        var id = ~req.params.type.indexOf('.') ? req.params.type : 'renderer.'+req.params.type;
        var schema = this.find(id);
        if (!res.locals.model)
            res.locals.model = new Model(req.params.type, schema);

        if (schema && schema.ref){
            //might need to delegate to other plugin so doing this
            // instead of an or.
            req.url = this.baseUrl+schema.ref.replace(/\./g, '/')+'.js';
            next();
        }else
            generate.call(this, res,  schema._id.replace('renderer.','')+ '.' + req.params.format)
    }.bind(this));

    PluginApi.prototype.routes.apply(this, arguments);
}

RendererPlugin.prototype.admin = function () {
    return new Model('renderer', [
        {
            url: this.pluginUrl + '/admin/configure',
            schema: {},
            fieldsets: [
                {legend: "JsonSchema Plugin", fields: ['url', 'pandoc_template', 'codegen', 'scala', 'java_opts', 'java']}
            ],
            plural: 'JsonSchema',
            title: 'JsonSchema Plugin',
            modelName: 'jsonschema'
        }
    ]);
}
module.exports = RendererPlugin;