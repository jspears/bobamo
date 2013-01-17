var bobamo = require('../../index'),
    swagger = require('./swagger'),
    express = bobamo.expressApi,
    Model = bobamo.DisplayModel,
    path = require('path'),
    fs = require('fs'),
    generateClient = require('./generate-client'),
    u = require('../../lib/util'), _u = require('underscore'), PluginApi = bobamo.PluginApi, util = require('util');

var JsonSchemaPlugin = function () {
    PluginApi.apply(this, arguments);
    this.conf = {
        url:'http://localhost:3001/',
        scala:process.env['SCALA_HOME'],
        java:process.env['JAVA_HOME'] || '/System/Library/Frameworks/JavaVM.framework/Versions/CurrentJDK/Home',
        java_opts:process.env['JAVA_OPTS'] || ' -XX:MaxPermSize=256M -Xmx1024M -DloggerPath=conf/log4j.properties',
        codegen:process.env['CODEGEN_HOME']
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
                },
                codegen:{
                    type:'Text',
                    placeholder:this.conf.codgen,
                    title:'swagger-codegen',
                    help:'The path to swagger codegen'
                },
                scala:{
                    type:'Text',
                    placeholder:this.conf.scala,
                    title:'Scala',
                    help:'Path to scala home scala executable should be in %scala%/bin/scala'
                },
                java:{
                    type:'Text',
                    placeholder:this.conf.java,
                    title:'JAVA_HOME',
                    help:'Path to java home'
                },
                java_opts:{
                    type:'Text',
                    placeholder:this.conf.java_opts,
                    title:'JAVA_OPTS',
                    help:'JAVA_OPTS env value'
                }

            },
            url:this.pluginUrl + '/admin/configure',
            fieldsets:[
                {legend:"JsonSchema Plugin", fields:['url', 'codegen', 'scala']}
            ],
            plural:'JsonSchema',
            title:'JsonSchema Plugin',
            modelName:'jsonschema'
        }
    ]);
}

JsonSchemaPlugin.prototype.filters = function () {
    this.app.get(this.pluginUrl + "/export/:type", function (req, res, next) {
        var type = req.params.type || 'Java';
        //make it safe since we use it to generate files and is potential a security hole.
        type.replace(/[^a-zA-Z0-9-_]/g, '');
        generateClient(this, type, function (err, filename) {
            if (err){
                console.log(err);
                return next(err);
            }
            var base = path.basename(filename);
            var stat= fs.statSync(filename);

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader("Content-Transfer-Encoding", "binary");
            res.setHeader("Content-Disposition", 'attachment; filename="' + base + '"');//fileName);
            res.setHeader("Content-Length", stat.size);
            require('util').pump(fs.createReadStream(filename), res);
            console.log('sent '+base+' '+stat.size);
        }.bind(this))
    }.bind(this));
    // var docs_handler = express.static(__dirname + '/../../../swagger-ui/dist/');
    var re = new RegExp(this.pluginUrl + '/docs(\/.*)?$');
    var resourceRe = new RegExp(this.pluginUrl + '/swagger(/resources\.json|/)?$')
    this.app.get(resourceRe, function (req, res, next) {
        req.url = this.pluginUrl + '/swagger/api-docs';
        next();
    }.bind(this));
    this.app.get(re, function (req, res, next) {
        if (req.url === this.pluginUrl + '/docs') { // express static barfs on root url w/o trailing slash
            res.writeHead(302, { 'Location':req.url + '/' });
            res.end();
            return;
        }
        // take off leading /docs so that connect locates file correctly
        req.url = this.baseUrl + 'js/' + this.name + '/swagger-ui' + req.params;
        next(req, res, next);
    }.bind(this));
    var app = this.app;
    var swagUrl = this.pluginUrl + '/swagger';
    var doMethod = function (type) {
        return function (path, cb) {
            var args = _.toArray(arguments);
            path = [swagUrl, path].join('');
            app[type].apply(app, [path, function (req, res, next) {
                req.url = req.url.substring(swagUrl.length);
                cb.call(this, req, res, next)
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
    var setup = this.setup = swagger.swagger(this.pluginManager.appModel, swagApp);
    this.setup.configure("http://localhost:3001" + swagUrl, this.pluginManager.appModel.version);
    console.log('using swagger at "http://localhost:3001' + swagUrl + '"');

    this.app.get(this.baseUrl + 'images/throbber.gif', function (req, res, next) {
        req.url = this.pluginUrl + '/js/swagger-ui/images/throbber.gif'
        next();
    }.bind(this));
    PluginApi.prototype.filters.call(this);
}
JsonSchemaPlugin.prototype.configure = function (conf) {
    _u.extend(this.conf, conf);
    var url = this.conf.url.replace(/(\/)?$/, '');

    var swagUrl = url + (this.pluginUrl + '/swagger');
    this.setup.configure(swagUrl, this.pluginManager.appModel.version);

    console.log('using swagger at "' + swagUrl + '"');

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
