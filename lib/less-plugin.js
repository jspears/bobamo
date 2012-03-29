var  LessFactory = require('./less-factory'), _u = require('underscore');

/**
 * Css Plugin
 * @param app
 * @param base
 * @param options
 */
module.exports = function (app, base, options) {
    var lessFactory = options && options.cssFactory || new LessFactory(options);
    app.all(base+'*', function(req,res,next){
       res.local('lessFactory', lessFactory);
       next();
    });

    app.get(base + 'js/views/admin/display.js', function (req, res, next) {
        res.render('generate/views/admin/display.js', {
            factory:lessFactory,
            layout:false
        });
    });

    app.get(base + 'less/:id?', function (req, res, next) {
        res.contentType('text/css');
        lessFactory.current(function onCss(err, obj){
            if (err) return next(err);
            res.send(obj.payload);
        }, req.params.id );
    });
    app.get(base + 'admin/less/:id?', function(req,res,next){
        var obj = _u.extend({}, lessFactory.getCache(req.params.id || req.body.id));
        delete obj.payload;

        res.send({
            status:0,
            payload:obj.variables
        })

    });
    app.post(base + 'admin/less', function (req, res, next) {
        delete req.body.variables;
        delete req.body.created;
        delete req.body.payload;
        var install = req.body.install;
        delete req.body.install;
        lessFactory.createCache(function (err, obj) {
            if (err)
                return next(err);
            var payload = _u.extend({}, obj);
            if (install)
                lessFactory.checksum = obj.id;

            res.send({
                status:0,
                payload:payload
            });
        }, req.body);
    });
    app.put(base + 'admin/less/:id?', function (req, res, next) {
        delete req.body.variables;
        delete req.body.created;
        delete req.body.payload;
        var id = req.body.id || req.params.id;
        var install = req.body.install;
        lessFactory.createCache(function (err, obj) {
            if (err)
                return next(err);
            var payload = _u.extend({}, obj);

            if (install)
                lessFactory.checksum = obj.id;

            res.send({
                status:0,
                payload:payload
            });
        }, req.body);
    });
};
