var bobamo = require('../../index'),
    swagger = require('./swagger'),
    express = bobamo.expressApi,
    Model = bobamo.DisplayModel,
    u = require('../../lib/util'), _u = require('underscore'), PluginApi = bobamo.PluginApi, util = require('util');

var JsonSchemaPlugin = function () {
    PluginApi.apply(this, arguments);
    this.conf = {
        url:'http://localhost:3001/'
    }
}
util.inherits(JsonSchemaPlugin, PluginApi);


JsonSchemaPlugin.prototype.modelToSchema = function (model, depends) {
    return    swagger.modelToSchema(model, depends, this.pluginManager);

}
JsonSchemaPlugin.prototype.appModel = function () {
    return {
        modelPaths:{},
        header:{
            'admin-menu':{
                'jsonschema':{
                    label:'Service API Documentation ',
                    href:'#jsonschema/view/doc'
                },
                'jsonschema-conf':{
                    label:'Service API Configuration ',
                    href:'#views/configure/jsonschema'
                }
            }
        }
    }
}
JsonSchemaPlugin.prototype.admin = function () {
    return new Model('jsonschema', [
        {
            schema:{
                url:{
                    type:'Text',
                    placeholder:this.conf.url,
                    title:'URL',
                    help:'The fully qualified url to this machine'
                }
            },
            url:this.pluginUrl + '/admin/configure',
            fieldsets:[
                {legend:"JsonSchema Plugin", fields:['url']}
            ],
            plural:'JsonSchema',
            title:'JsonSchema Plugin',
            modelName:'jsonschema'
        }
    ]);
}
JsonSchemaPlugin.prototype.filters = function(){
   // var docs_handler = express.static(__dirname + '/../../../swagger-ui/dist/');
    var re = new RegExp(this.pluginUrl+'/docs(\/.*)?$');
    this.app.get(re, function(req, res, next) {
        if (req.url === this.pluginUrl+'/docs') { // express static barfs on root url w/o trailing slash
            res.writeHead(302, { 'Location' : req.url + '/' });
            res.end();
            return;
        }
        // take off leading /docs so that connect locates file correctly
        req.url = this.baseUrl + 'js/' + this.name + '/swagger-ui'+req.params;
        next(req, res, next);
    }.bind(this));
    var app = this.app;
    var swagUrl = this.pluginUrl+'/swagger';
    var doMethod = function(type){
        return function(path, cb){
            var args = _.toArray(arguments);
            path = [swagUrl,path].join('');
            app[type].apply(app, [path, function(req,res,next){
                req.url = req.url.substring(swagUrl.length);
                cb.call(this, req,res,next)
            }]);
        }
    }
    var swagApp = {
        get:doMethod('get'),
        put:doMethod('put'),
        post:doMethod('post'),
        delete:doMethod('del'),
        del:doMethod('del')
    };
    var setup = this.setup = swagger.swagger(this.pluginManager.appModel,swagApp );
    this.setup.configure("http://localhost:3001"+swagUrl, this.pluginManager.appModel.version);
    console.log('using swagger at "http://localhost:3001'+swagUrl+'"');

    this.app.get(this.baseUrl+'images/throbber.gif', function(req,res,next){
        req.url = this.pluginUrl+'/js/swagger-ui/images/throbber.gif'
        next();
    }.bind(this));
    PluginApi.prototype.filters.call(this);
}
JsonSchemaPlugin.prototype.configure = function(conf){
    _u.extend(this.conf, conf);
    var url = this.conf.url.replace(/(\/)?$/, '');
    var swagUrl = url+(this.pluginUrl+'/swagger');
    this.setup.configure(swagUrl, this.pluginManager.appModel.version);

    console.log('using swagger at "'+swagUrl+'"');

}

JsonSchemaPlugin.prototype.routes = function () {

    this.app.get(this.pluginUrl + '/doc/:type', function (req, res, next) {
        var type = req.params.type;
        var jsonSchema = this.modelToSchema(type);
        this.generate(res, 'view/model.html', {jsonSchema:jsonSchema, model:this.pluginManager.modelPaths[type]});
    }.bind(this));

    PluginApi.prototype.routes.apply(this, arguments);
}
;

module.exports = JsonSchemaPlugin;
