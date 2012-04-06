var _u = require('underscore'), jqtpl = require('jqtpl'), PluginManager = require('./plugin-manager'), path =require('path');

function bobamo(options, express) {
    var options = _u.extend(this, options);
    if (options.uri) {
        if (!options.mongoose) {
            options.mongoose = require('mongoose');
            console.warn('using bobamo mongoose, you are better off supplying your own');
        }
        options.mongoose.connect(options.uri);
    }

    if (!options.mongoose)
        throw new Error("no mongoose or mongoose uri defined");

    var pdir = path.join(path.resolve(), 'plugins');
    console.log('bobamo plugins', pdir)
    return {
        __mounted:function (app) {
           var base = options.basepath || (options.basepath = '');
            app.register('.html', jqtpl.express);
            app.register('.js', jqtpl.express);
            options.baseUrl = '/'+path.basename(base);
            if (!options.pluginDir)
                options.pluginDir = pdir;
            new PluginManager(options, app)
            console.log('mounted bobamo on ', base);
        },
        handle:function (req, res, next) {
            next();
        },
        set:function (base, path) {
            options[base] = path;
        }
    }
};
module.exports = bobamo;
