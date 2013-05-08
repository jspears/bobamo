var bobamo = require('../../index'),
    swagger = require('./genschema'),
    gen_resource = require('./genresource'),
    express = bobamo.expressApi,
    Model = bobamo.DisplayModel,
    path = require('path'),
    fs = require('fs'),
    generateClient = require('./generate-client'),
    u = require('../../lib/util'), J=require('../../lib/stringify'), _u = require('underscore'),
    PluginApi = bobamo.PluginApi, util = require('util');
var defaultConf = {
    scala: process.env['SCALA_HOME'],
    java: process.env['JAVA_HOME'] || '/System/Library/Frameworks/JavaVM.framework/Versions/CurrentJDK/Home',
    java_opts: process.env['JAVA_OPTS'] || ' -XX:MaxPermSize=256M -Xmx1024M -DloggerPath=conf/log4j.properties',
    codegen: process.env['CODEGEN_HOME'],
    pandoc_template: null

}
var JsonSchemaPlugin = function () {
    PluginApi.apply(this, arguments);

    this.conf = _u.extend({ }, defaultConf);
}
util.inherits(JsonSchemaPlugin, PluginApi);
JsonSchemaPlugin.prototype.SwaggerToMarkdown = require('./genmarkdown');

JsonSchemaPlugin.prototype.modelToSchema = function (model, models) {
    model = _u.isString(model) ? this.pluginManager.appModel.modelFor(model) : model;
    if (!model) {
        console.log('could not model ' + model);
        return {};
    }
    var modelPaths = this.pluginManager.appModel.modelPaths;
    var ret = swagger.modelToSchema(model, models || {}, function (m) {
        return modelPaths && m && m.modelName && modelPaths[m.modelName]
    });

    return ret;

}
JsonSchemaPlugin.prototype.appModel = function () {
    return {
        modelPaths: {},
        header: {
            'admin-menu': {
                'jsonschema': {
                    label: 'Service API Documentation ',
                    href: '#jsonschema/view/doc'
                },
                'jsonschema-doc': {
                    label: 'Service Edit Documentation ',
                    href: '#jsonschema/view/markdown'
                },
                'jsonschema-conf': {
                    label: 'Service API Configuration ',
                    href: '#views/configure/jsonschema'
                }
            }
        }
    }
}
JsonSchemaPlugin.prototype.admin = function () {
    return new Model('jsonschema', [
        {
            schema: {
                url: {
                    type: 'Text',
                    placeholder: this.conf.url,
                    title: 'URL',
                    help: 'The fully qualified url to this machine'
                },
                codegen: {
                    type: 'Text',
                    placeholder: this.conf.codegen,
                    title: 'swagger-codegen',
                    help: 'The path to swagger codegen'
                },
                scala: {
                    type: 'Text',
                    placeholder: this.conf.scala,
                    title: 'Scala',
                    help: 'Path to scala home scala executable should be in %scala%/bin/scala'
                },
                java: {
                    type: 'Text',
                    placeholder: this.conf.java,
                    title: 'JAVA_HOME',
                    help: 'Path to java home'
                },
                java_opts: {
                    type: 'Text',
                    placeholder: this.conf.java_opts,
                    title: 'JAVA_OPTS',
                    help: 'JAVA_OPTS env value'
                },
                pandoc_template: {
                    type: 'Text',
                    title: 'Template',
                    help: 'Pandoc template directory',
                    placeholder: this.conf.pandoc_template
                }

            },
            url: this.pluginUrl + '/admin/configure',
            fieldsets: [
                {legend: "JsonSchema Plugin", fields: ['url', 'pandoc_template', 'codegen', 'scala', 'java_opts', 'java']}
            ],
            plural: 'JsonSchema',
            title: 'JsonSchema Plugin',
            modelName: 'jsonschema'
        }
    ]);
}

var docRe = /^document-(.*)/;
var extensionMap = JsonSchemaPlugin.prototype.extensionMap = {
    'html5': {
        ext: 'html',
        contentType: 'text/html'
    },
    'html+lhs': {
        ext: 'html',
        contentType: 'text/html'
    },
    'html5+lhs': {
        ext: 'html',
        contentType: 'text/html'
    },
    's5': {
        ext: 'html',
        contentType: 'text/html'
    },
    'slidy': {
        ext: 'html',
        contentType: 'text/html'
    },
    'dzslides': {
        ext: 'html',
        contentType: 'text/html'
    }
}
JsonSchemaPlugin.prototype.filters = function () {
    /**ugly hack to get the print screen to load **/
    this.app.get(this.pluginUrl + '/js/main.js*', function (req, res, next) {
        req.query.app = this.pluginUrl + '/js/print.js';
        req.url = this.baseUrl + 'js/main.js';
        next();
    }.bind(this));

    var exportTo = function (req, res, next) {
        var type = req.params.type || 'Java';
        var appModel = this.pluginManager.appModel;
        //make it safe since we use it to generate files and is potential a security hole.
        type.replace(/[^a-zA-Z0-9-_+]/g, '');
        if (docRe.test(type)) {
            var pdc = require('node-pandoc');
            var docType = type.replace(docRe, "$1");
            // console.log('markdown', md);
            var opts = [ '--data-dir='+process.cwd()+'/', '-S']
            var conf = _u.extend({title: appModel.title}, this.conf, req.query, req.body);
            if (conf.pandoc_template)
                opts.push('--template=' + process.cwd() + '/' + conf.pandoc_template);
            if (conf.title)
                opts.push('--variable=title:' + conf.title + '');
            if (conf.toc !== false)
                opts.push('--toc');
            var md = req.body && req.body && req.body.markdown || this.markdown();
            pdc(md, 'markdown', docType, opts, function (err, resp) {
                if (err) {
                    res.cookie('download', type)
                    return next(err);
                }
                var em = extensionMap[docType];
                var ext = docType;
                var fileName = bobamo.inflection.hyphenize((appModel.title + ' ' + appModel.version).replace(/\s*/, '')) + '.' + ext;
                if (em) {
                    ext = em.ext;
                    res.setHeader('Content-Type', em.contentType);
                } else {
                    res.setHeader("Content-Transfer-Encoding", "binary");
                    res.setHeader("Content-Disposition", 'attachment; filename="' + fileName + '"');//fileName);

                }
                res.setHeader("Content-Length", resp.length);

                res.send(resp);

            });
        }
        else {
            generateClient(this, type, function (err, filename) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                var base = path.basename(filename);
                var stat = fs.statSync(filename);

                res.setHeader('Content-Type', 'application/zip');
                res.setHeader("Content-Transfer-Encoding", "binary");
                res.setHeader("Content-Disposition", 'attachment; filename="' + base + '"');//fileName);
                res.setHeader("Content-Length", stat.size);
                res.cookie('download', type)
                require('util').pump(fs.createReadStream(filename), res);
                console.log('sent ' + base + ' ' + stat.size);
            }.bind(this))
        }
    }.bind(this)
    this.app.get(this.pluginUrl + "/export/:type", exportTo);
    this.app.post(this.pluginUrl + "/export/:type", exportTo);

    ;
// var docs_handler = express.static(__dirname + '/../../../swagger-ui/dist/');
    var re = new RegExp(this.pluginUrl + '/docs(\/.*)?$');

    this.app.get(re, function (req, res, next) {
        if (req.url === this.pluginUrl + '/docs') { // express static barfs on root url w/o trailing slash
            res.writeHead(302, { 'Location': req.url + '/' });
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
JsonSchemaPlugin.prototype.swaggerUrl = function () {
    var url = this.conf.url && this.conf.url.replace(/(\/)?$/, '');
    var swagUrl = url + (this.pluginUrl + '/api');
    return swagUrl;
}
JsonSchemaPlugin.prototype.configure = function (conf) {
    PluginApi.prototype.configure.call(this, conf);
    _u.extend(this.conf, defaultConf, this.conf);
    this.swaggerUrl();
    return null;
}
JsonSchemaPlugin.prototype.resource = function (modelName) {
    var appModel = this.pluginManager.appModel;
    var version = appModel.version, swagUrl = this.swaggerUrl();
    if (modelName) {
//        var model = this.pluginManager.appModel
        var doc = gen_resource.resourceFor(appModel.modelFor(modelName), swagUrl, version, function (mName) {
            return _u.isString(mName) ? appModel.modelFor(mName) : mName;
        }.bind(this));
    } else {
        var doc = gen_resource.resources(appModel.modelPaths, swagUrl, version);
    }
    return doc;
}
JsonSchemaPlugin.prototype.markdown = function () {
    var appModel = this.pluginManager.appModel;
    return new this.SwaggerToMarkdown({
        apiname: this.pluginManager.appModel.title,
        basePath: this.swaggerUrl(),
        resourcefile: this.resource(),
        authors: appModel.authors,
        revisions: appModel.revisions,
        modified: appModel.modified ? new Date(appModel.modified) : new Date(),
        specifications: Object.keys(appModel.modelPaths).map(this.resource, this)
    }).print();
}
JsonSchemaPlugin.prototype.metaService = function () {
    var appModel = this.pluginManager.appModel;
    var resources = _u.flatten(_u.flatten(Object.keys(appModel.modelPaths).map(this.resource, this).map(function (v) {
            return v.apis;
        })).map(function (v) {
            var path = v.path;
            var fp = (((path[0] == '/' ) ? path.substring(1) : path).split('/')).shift();

            return v.operations.map(function (v) {
                var val = v.httpMethod + '[' + fp + '.' + v.nickname + ']';
                return {
                    label: v.nickname + ' [' + v.httpMethod + ' ' + path + ']',
                    val: val
                }
            })
        }));
    return resources;
}

JsonSchemaPlugin.prototype.routes = function () {
    this.app.get(this.pluginUrl + '/meta/service', function (req, res) {

        res.send({
            status: 0,
            payload: this.metaService()
        })

    }.bind(this));


    var resource = function (req, res, next) {
        res.send(this.resource(req.params.type));
    }.bind(this);
    this.app.get(this.pluginUrl + '/markdown', function (req, res, next) {
        res.setHeader('Content-Type', 'application/markdown');
        res.send(this.markdown());
    }.bind(this));

    this.app.get(this.pluginUrl + '/api/resources.:format', resource);
    this.app.get(this.pluginUrl + '/api-docs.:format?/:type?', resource);
    this.app.get(this.pluginUrl + '/api/api-docs.:format?/:type?', resource);
    this.app.all(this.pluginUrl + '/api/*', function (req, res, next) {
        req.url = req.url.replace(this.pluginUrl + '/api', this.baseUrl + 'rest');
        console.log('rest', req.url);
        next();
    }.bind(this));

    PluginApi.prototype.routes.apply(this, arguments);
}

module.exports = JsonSchemaPlugin;
