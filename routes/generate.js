var mongoose = require('mongoose');
module.exports = function (app) {
    var jsRe = /\.js$/;

    app.get('/js/:super?/views/:type/:view', function (req, res, next) {
   //     res.contentType('application/javascript');
        res.render(j('generate', 'views', req.params.view), makeOptions(req));
    });
    app.get('/js/:super?/:clazz/:type', function (req, res, next) {
   //     res.contentType('application/javascript');
        res.render(j('generate', req.params.clazz+'.js'), makeOptions(req))
    });
    app.get('/templates/:super?/:type/:view', function (req, res, next) {
     //   res.contentType('text/html; charset=utf-8');
       res.render(j('generate', 'templates', req.params.view), makeOptions(req))

    });
    app.get('/tpl/:super?/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', 'templates', req.params.view), makeOptions(req))

    });

    function j(){
        return Array.prototype.slice.call(arguments,0).join('/');
    }
    function makeOptions(req) {

        var opts = {
            layout:false,
            params:req.params
        }
        if (req.params.type){
            opts.schema = mongoose.model(req.params.type.replace(jsRe, ''));
        }
        return opts;
    }
}