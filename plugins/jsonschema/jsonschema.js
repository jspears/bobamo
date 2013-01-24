var bobamo = require('../../index'),
    swagger = require('./genschema'),
    express = bobamo.expressApi,
    Model = bobamo.DisplayModel,
    path = require('path'),
    fs = require('fs'),
    SwaggerToMarkdown = require('swagger-to-markdown'),
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
     model = _u.isString(model) ? this.pluginManager.appModel.modelFor(model) : model;
    if (!model){
        console.log('could not model '+model);
        return {};
    }
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
                    placeholder:this.conf.codegen,
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
                {legend:"JsonSchema Plugin", fields:['url', 'codegen', 'scala', 'java_opts', 'java']}
            ],
            plural:'JsonSchema',
            title:'JsonSchema Plugin',
            modelName:'jsonschema'
        }
    ]);
}

JsonSchemaPlugin.prototype.filters = function () {
    /**ugly hack to get the print screen to load **/
    this.app.get(this.pluginUrl+'/js/main.js*', function(req,res,next){
        req.query.app = this.pluginUrl+'/js/print.js';
        req.url = this.baseUrl+'js/main.js';
        next();
    }.bind(this));

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
            res.cookie('download', type)
            require('util').pump(fs.createReadStream(filename), res);
            console.log('sent '+base+' '+stat.size);
        }.bind(this))
    }.bind(this));
    // var docs_handler = express.static(__dirname + '/../../../swagger-ui/dist/');
    var re = new RegExp(this.pluginUrl + '/docs(\/.*)?$');

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

    this.app.get(this.baseUrl + 'images/throbber.gif', function (req, res, next) {
        req.url = this.pluginUrl + '/js/swagger-ui/images/throbber.gif'
        next();
    }.bind(this));
    PluginApi.prototype.filters.call(this);
}
JsonSchemaPlugin.prototype.swaggerUrl = function(){
    var url = this.conf.url.replace(/(\/)?$/, '');
    var swagUrl = url + (this.pluginUrl + '/api');
    console.log('using swagger at "'+swagUrl+'"');
    return swagUrl;
}
JsonSchemaPlugin.prototype.configure = function (conf) {
    _u.extend(this.conf, conf);
    this.swaggerUrl();
}
var builtin_types = 'byte boolean int long float double string Date void'.split(' ');
JsonSchemaPlugin.prototype.resource = function(modelName){
    var swagUrl = this.swaggerUrl();
    var doc = {
        apiVersion: this.pluginManager.appModel.version,
        swaggerVersion: "1.1",
        basePath:swagUrl ,
        apis:[]
    }
    console.log('swagUrl',swagUrl)
    if (!modelName){
        doc.apis = _u.map(this.pluginManager.appModel.modelPaths, function(v,k){
            return {
                path: "/api-docs/"+k,
                description:v.description || v.help || ''
            }
        });
    }else{
        var model = this.pluginManager.appModel.modelPaths[modelName];
        if (!model){
            console.log('modelPaths', this.pluginManager.appModel.modelPaths)
            return res.send({status:1, message:'Could not locate model '+modelName})

        }
        var self = this;
        var ops = {};
        doc.models = {};
        _u.each(_u.flatten([
            swagger.all(model, modelName),
            swagger.one(model, modelName),
            swagger.post(model, modelName),
            swagger.put(model, modelName),
            swagger.del(model, modelName),
            swagger.finders(model,modelName)

        ]), function forEachOperation(ret){
            _u.extend( {
                httpMethod:'GET'
            }, ret)
            var restPath = ['/', modelName, (ret.path ? '/'+ret.path : '')].join('');
            _u.each(ret.parameters, function(v){
                if (v.paramType == 'path'){
                    restPath+='/{'+ v.name+'}'
                }
            });
            var rName = ret.responseClass.replace(/List\[([^\]]*)\]/, "$1");
            if (!~builtin_types.indexOf(rName) ){
//                   rc[rClass] = ret.responseModel;
                if (!doc.models[rName]){
                    doc.models[rName] = self.modelToSchema(ret.responseModel|| rName);
                    doc.models[rName].id = rName;
                }
            }

            (ops[restPath] || (ops[restPath] = [])).push(_u.omit(ret, 'responseModel'));

        });

        doc.apis =  _u.map(ops, function(v,k){
            return {
                path:k,
                operations:v,
                description:'Operations about '+modelName
            };
        });

        doc.resourcePath = '/'+modelName;
    }
//        res.send(doc);
    return doc;
}
JsonSchemaPlugin.prototype.markdown = function(){
    return new SwaggerToMarkdown().$enhance({
        apiname:this.pluginManager.appModel.title,
        basePath:this.swaggerUrl(),
        resourcefile:this.resource(),
        specifications:Object.keys(this.pluginManager.appModel.modelPaths).map(this.resource, this)
    }).print();
}
JsonSchemaPlugin.prototype.routes = function () {


    var resource = function(req,res,next){
        res.send(this.resource(req.params.type));
    }.bind(this);
    this.app.get(this.pluginUrl+'/markdown', function(req,res,next){
       res.setHeader('Content-Type', 'application/markdown');
       res.send(this.markdown());
    }.bind(this));
    this.app.get(this.pluginUrl+'/api/resources.:format', resource);
    this.app.get(this.pluginUrl+'/api-docs.:format?/:type?', resource);
    this.app.get(this.pluginUrl+'/api/api-docs.:format?/:type?', resource);
    this.app.all(this.pluginUrl+'/api/*', function(req,res,next){
       req.url = req.url.replace(this.pluginUrl+'/api', this.baseUrl+'rest');
        console.log('rest', req.url);
       next();
    }.bind(this));
//    this.app.get(this.pluginUrl + '/doc/:type', function (req, res, next) {
//        var type = req.params.type;
//        var jsonSchema = this.modelToSchema(type);
//        this.generate(res, 'view/model.html', {jsonSchema:jsonSchema, model:this.pluginManager.modelPaths[type]});
//    }.bind(this));
    PluginApi.prototype.routes.apply(this, arguments);
}
;

module.exports = JsonSchemaPlugin;
