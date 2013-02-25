var bobamo = require('../../index'), PluginApi = bobamo.PluginApi, _ = require('underscore'), Model = bobamo.DisplayModel;

var RendererPlugin = function () {
    PluginApi.apply(this, arguments);
    this.conf = {};
}

require('util').inherits(RendererPlugin, PluginApi);
RendererPlugin.prototype.appModel = function () {
    return {
        modelPaths:{},
        header:{
            'admin-menu':{
                'renderer':{
                    label:'Configure Renderers',
                    href:'#views/renderer/admin/list'
                }
            }
        }
    }
}
RendererPlugin.prototype.configure = function (conf) {
    Object.keys(this.conf).forEach(function (k) {
        delete this.conf[k];
    }, this)
    _.extend(this.conf, conf);
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
    var first = _.first(_.where(renders, {name:name})) || _.first(_.where(renders, {_id:_id}))
    if (!first) {
        console.warn('no renderer matching [' + type + ']', name, _id);
        return;
    }
    var conf = this.conf[s.join('/')];
    if (conf) {
        first.defaults = conf.defaults;
    }


    return first;
}
RendererPlugin.prototype.filters = function () {
    this.app.get(this.pluginUrl + '/views/:type/:view.:format?', function (req, res, next) {
      //  var schema = this.rendererFor(req.params.renderer);
        var id = req.params.type;
        var schema = this.find(id);

        res.locals.model = new Model(req.params.type, schema);
        req.url = this.baseUrl+ req.params.view + '.' + req.params.format
        next();
    }.bind(this));
    PluginApi.prototype.filters.apply(this, arguments);
}
var re = /^renderer[\/\.]/;

RendererPlugin.prototype.renderers = function () {
    console.log('conf', this.conf);
    var ret = Object.keys(this.conf).filter(re.test, re).map(function (k) {
        return _.extend({name:k.split(splitRe).pop(), _id:k}, this.conf[k])
    }, this);

    return ret;
}
RendererPlugin.prototype.find = function(id){
    return _.first(this.listRenderers().filter(function(v){ return v._id == id }));
}
RendererPlugin.prototype.listRenderers = function () {
    var renderers = this.pluginManager.renderers;
    return _.flatten(_.values(_.map(renderers, function (v, k) {
        return _.map(v, function (vv) {
            var ret = vv;
            if (vv.ref) {
                var ref = vv;
                while (ref && ref.ref) {
                    ref = this.rendererFor(ref.ref)
                }
                ret = _.extend({}, ref, vv);
            }
            ret._id = k + '.' + vv.name
            return ret;
        }, this);
    }, this)));
}
var slashdot = /[\.\/]/g;
RendererPlugin.prototype.routes = function () {
    var save = function (req, res, next) {
        console.log('post', req.body);
        var _id = req.body._id;
        delete req.body._id;
        this.conf[_id.replace(slashdot, '/')] = {};
        this.save(this.conf, function () {
            res.send({
                status:0
            });
        });

    }.bind(this);
    this.app.get(this.pluginUrl +'/admin/:id', function(req,res,next){
        var renderer = this.find(req.params.id.replace(slashdot, '.'));
        if (renderer)
       res.send({
           status:0,
           payload:renderer.defaults
       })
        else
            res.send({
                status:1
            })
    }.bind(this));
    this.app.put(this.pluginUrl + '/admin/:id', function(req,res,next){
        var key = req.params.id.replace(slashdot,'/');
        this.conf[key].defaults = req.body;
        this.save(this.conf, function(){
            res.send({
                status:0
            })
        })
    }.bind(this));

    this.app.put(this.pluginUrl + '/admin/:id/:name', function(req,res,next){
        delete req.body.status;
        delete req.body._id;
        var key = 'renderer/'+req.params.name
        this.conf[key] = {
            ref:req.params.id,
            defaults:req.body,
            name:req.params.name
        }
        this.save(this.conf, function(){
            res.send({
                status:0,
                payload:{
                    _id:key.replace(slashdot, '.')
                }
            })
        })
    }.bind(this));
    this.app.put(this.pluginUrl + '/admin', save);
    this.app.get(this.pluginUrl + '/renderers', function (req, res, next) {
        res.send({
            status:0,
            payload:this.listRenderers().map(function (v) {
                return _.omit(v, 'schema')
            })

        })
    }.bind(this));
    this.app.get(this.pluginUrl + '/renderers/:id', function (req, res, next) {
        var id = req.params.id;
        var conf = this.find(id);
        if (conf)
            res.send({
                status:0,
                payload:conf.defaults

            })
        else
            res.send({
                status:1,
                errors:[
                    { '_id':'No renderer found for ['+id+']'}
                ]
            })
    }.bind(this));

    PluginApi.prototype.routes.apply(this, arguments);
}
RendererPlugin.prototype.admin = function () {
    return new Model('renderer', [
        {
            url:this.pluginUrl + '/admin/configure',
            schema:{},
            fieldsets:[
                {legend:"JsonSchema Plugin", fields:['url', 'pandoc_template', 'codegen', 'scala', 'java_opts', 'java']}
            ],
            plural:'JsonSchema',
            title:'JsonSchema Plugin',
            modelName:'jsonschema'
        }
    ]);
}
module.exports = RendererPlugin;