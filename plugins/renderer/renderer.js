var bobamo = require('../../index'), PluginApi = bobamo.PluginApi, _ = require('underscore'), Model = bobamo.DisplayModel;

var RendererPlugin = function () {
    PluginApi.apply(this, arguments);
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
RendererPlugin.prototype.modelFor = function (type, name) {
    if (!name) {
        var s = type.split('.');
        type = s[0], name = s[1];
    }
    var renders = this.pluginManager.exec(type, 'renderers');
    return _.first(_.where(renders, {name:name}))

}
RendererPlugin.prototype.filters = function () {
    this.app.get(this.pluginUrl + '/views/:renderer/:view.:format?', function (req, res, next) {
        console.log('here in filter');
        res.locals('model', new Model('renderer', this.modelFor(req.params.renderer)));
        req.url = '/js/views/'+req.params.renderer+'/'+req.params.view;
        console.log('rewrite url to', req.url);
        next();
    }.bind(this));
    PluginApi.prototype.filters.apply(this, arguments);
}

RendererPlugin.prototype.routes = function () {
    this.app.get(this.pluginUrl + '/renderers', function (req, res, next) {
        res.send({
            status:0,
            payload:_.flatten(_.values(_.map(this.pluginManager.renderers, function (v, k) {
                return _.map(v, function (vv) {
                    vv._id = k + '/' + vv.name;
                    return vv;
                });
            })))
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