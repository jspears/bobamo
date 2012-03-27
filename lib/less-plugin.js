var less = require('less'), fs = require('fs'), _u = require('underscore'), crypto = require('crypto');
;
var path = __dirname + '/../public/js/libs/bootstrap/less';
// CSS Reset
var at_imports = ["reset.less",
    "variables.less",
    "mixins.less",
    "scaffolding.less",
    "grid.less",
    "layouts.less",
    "type.less",
    "code.less",
    "forms.less",
    "tables.less",
    "sprites.less",
    "dropdowns.less",
    "wells.less",
    "component-animations.less",
    "close.less",
    "buttons.less",
    "button-groups.less",
    "alerts.less",
    "navs.less",
    "navbar.less",
    "breadcrumbs.less",
    "pagination.less",
    "pager.less",
    "modals.less",
    "tooltip.less",
    "popovers.less",
    "thumbnails.less",
    "labels.less",
    "progress-bars.less",
    "accordion.less",
    "carousel.less",
    "hero-unit.less",
    "utilities.less"]

module.exports = function (app, base, model) {
    var content = {};
    function genImports(){

        var str = [];
        _u(at_imports).each(function onImport(v, k) {
            str.push('@import "' + v + '";\n');
        });
        return str;
    }
    app.get(base + 'less/:shasum?', function (req, res, next) {
        var c = req.params.shasum && content[req.params.shasum];
        res.contentType('text/css');
        if (c) {
            c.lastAccess = Date.now();
            res.send(c.payload);
        }else{
            parseLessFile(function(obj){
                res.send(obj.payload);
            }, next)(null, genImports().join(''));
        }
    });
    app.post(base + 'less', function (req, res, next) {
        var str = genImports();

        _u(req.body).each(function onBodyPost(k, v) {
            if (v && k)
                str.push('@' + v + ': ' + k + ';\n');
        });
        parseLessFile(function(obj){
            res.send({
                status:0,
                payload:obj.checksum
            })
        }, next)(null, str.join(''));

    });

    var parseLessFile = function (send, next) {
        var shasum = crypto.createHash('sha1');
        var parser = new (less.Parser)({
            paths:[path],
            filename:path + '/bootstrap.less'
        });
        return function (e, data) {
            if (e) {
                console.warn('error parsing', e);
                return next(e);
            }

            parser.parse(data, function (err, tree) {
                if (err) {
                    less.writeError(err, {});
                    return next(err);
                } else {
                    try {
                        var css = tree.toCSS();
                        shasum.update(css);
                        var checksum = shasum.digest('hex');
                        content[checksum] = {
                            created:Date.now(),
                            payload:css
                        };
                        return send({
                            checksum:checksum,
                            payload:css
                        });
                    } catch (e) {
                        less.writeError(e, {});
                        return next(e);
                    }
                }
            });
        }
    };
};
