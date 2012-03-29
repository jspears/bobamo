var generate = require('./generate'), _u = require('underscore'), mutil = require('mers/lib/util'), mers = require('mers'), jqtpl = require('jqtpl'),
    App = require('./display-model'),
    mongooseApp = require('./mongoose-adapter'),
    packageApp = require('./package-adapter')
    adminPlugin = require('./admin-plugin')
    ;
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
                base +='/'
            if (base.length > 1 && base[0] !== '/'){
                base = '/'+base;
            }
            if (!options.displayFactory){
                options.displayFactory =  new App(mongooseApp(options), packageApp);
            }

            // app.use(options.basepath || '/', express.static(dir + '/public'));
            app.set('views', dir + '/views');
            app.set('view engine', "html");
            app.register('.html', jqtpl.express);
            app.register('.js', jqtpl.express);
            app.use(express.bodyParser());
            app.get(base + '*', function(req,res,next){

                req._url =req.url;
                req.url = req.url.substring(base.length - 1);
                next();

            }, express.static(dir + '/public'), function(req,res,next){
                req.url = req._url;
                next();
            });
            adminPlugin(app, base,  options.displayFactory);
            require('./less-plugin')(app,base, options.displayFactory);
            app.all(new RegExp(base + 'api/*'), function (req, res, next) {
                req.query.transform = mutil.split(req.query.transform, ',', ['_idToId']);
                next();
            });

            app.use(base + 'api', mers(_u.extend({
            }, options, {

                transformers:{
                    labelval:function (m) {
                        var model =  options.displayFactory.modelFor(m.modelName);
                        var labelAttr = model && model.labelAttr;
                        return function (obj) {
                            return {
                                val:obj._id || obj.id,
                                label:labelAttr && obj[labelAttr] ? obj[labelAttr] : m.modelName + '[' + (obj.id || obj._id)+']'
                            }
                        }
                    },
                    _idToId:function (M) {
                        return function (obj) {
                            if (!obj) return null;
                            var o = obj.toObject ? obj.toObject() : obj;
                            o.id = obj._id;
                            delete o._id;
                            delete o.id_;
                            delete o.managerId_;
                            if (M && M.modelName == 'user')
                                 o.password = '';
                            var manager = obj.manager;
                            o.managerFirstName = manager ? manager.firstName : '';
                            o.managerLastName = manager ? manager.lastName : '';
                            o.managerId = manager && manager._id ? manager._id.toString() : manager || '';
                            delete o.reports;
                            delete o.manager;
                            return o;
                        }
                    }
                }

            })).rest());


            app.get(base, function (req, res, next) {
                res.redirect((base || '/') + 'index.html');
            });

            generate(options, app)
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
