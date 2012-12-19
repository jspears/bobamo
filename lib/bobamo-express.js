var _u = require('underscore'), jqtpl = require('jqtpl'), con = require('consolidate'), PluginManager = require('./plugin-manager'), path =require('path');

function bobamo(options) {
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
            if (app.register){
            app.register('.html', jqtpl.express);
            app.register('.js', jqtpl.express);
            }else{
                app.engine('html', con.jqtpl);
                app.engine('js', con.jqtpl);
             }

            options.baseUrl = '/'+path.basename(base);
            if (!options.pluginDir)
                options.pluginDir = pdir;
            this.pluginManager = new PluginManager(options, app)
            console.log('mounted bobamo on ', base);
        },
        handle:function (req, res, next) {
            next();
        },
        set:function (base, path) {
            options[base] = path;
        },
        emit:function(event, app){
            if (event == 'mount'){
                this.__mounted(app);
            }
        }
    }
};
module.exports = bobamo;
