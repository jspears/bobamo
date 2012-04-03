var _u = require('underscore'), jqtpl = require('jqtpl'), PluginManager = require('./plugin-manager');

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

    return {
        __mounted:function (app) {
            var dir = __dirname + "/..";
            var base = options.basepath || (options.basepath = '');
            if (base[base.length - 1] != '/')
                base += '/'
            if (base.length > 1 && base[0] !== '/') {
                base = '/' + base;
            }
            // app.use(options.basepath || '/', express.static(dir + '/public'));
            app.set('views', dir + '/views');
            app.set('view engine', "html");
            app.register('.html', jqtpl.express);
            app.register('.js', jqtpl.express);
            app.use(express.bodyParser());

            new PluginManager(options, app)
            console.log('mounted bobamo on ', base, dir);
        },
        handle:function (req, res, next) {
            //          console.log('handle',req,res);
            next();
            //   router.middleware(req, res, next);
        },
        set:function (base, path) {
            options[base] = path;
        }
    }
}
;
module.exports = bobamo;
