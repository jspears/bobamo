var  LessFactory = require('./less-factory');


module.exports = function (app, base, options) {
    var content = {};
    var def_shasum;
    var lessFactory = options && options.cssFactory || new LessFactory(options);
    app.get(base + 'js/views/admin/display.js', function (req, res, next) {
        var opts = {
            factory:lessFactory,
            layout:false
        };
        res.render('generate/views/admin/display.js', opts);
    });

    app.get(base + 'less/:shasum?', function (req, res, next) {
        var c = req.params.shasum && content[req.params.shasum || def_shasum];
        res.contentType('text/css');
        if (c) {
            c.lastAccess = Date.now();
            res.send(c.payload);
        } else {
            lessFactory.createCss(function (err, obj) {
                if (err)
                    return next(err);
                def_shasum = obj.checksum;
                res.send(update(obj).payload);
            },{});
        }
    });
    function update(obj){
        return content[obj.checksum] = {
            payload:obj.css,
            created:Date.now()
        }
    }
    app.post(base + 'admin/less', function (req, res, next) {

        lessFactory.createCss(function (err, obj) {
            if (err)
                return next(err);
            update(obj)
            res.send({
                status:0,
                payload: obj.checksum
            })
        }, req.body);

    });

};
