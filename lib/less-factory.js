var fs = require('fs'), path = require('path'), _u = require('underscore'), inflection = require('./inflection'), crypto = require('crypto'), less = require('less');
function CssFactory() {
    this.__defineGetter__('variables', function () {
        var readp = [];
        var m = module;
        var vis = {};
        while (typeof vis[m.id] === 'undefined') {
            var p = path.join(path.dirname(m.filename), '/../public/js/libs/bootstrap/less/variables.less');
            if (path.existsSync(p)) {
                readp.push(p)
            }

            if (m.parent.parent === null || m.parent == m) {
                console.log('break')
                break;
            }
            vis[m.id] = true;
            m = module.parent;

        }
        ;
        var vars = {};
        readp.forEach(function (v, k) {
            this.readVariables(fs.readFileSync(v, 'utf-8').split('\n'), vars, v);
        }, this);

        return vars;
    });
    this.__defineGetter__('paths', function () {
        var pt = {};
        var m = module;
        var vis = {};
        while (typeof vis[m.id] === 'undefined') {
            var p = path.join(path.dirname(m.filename), '/../public/js/libs/bootstrap/less');
            if (path.existsSync(p)) {
                pt[p] = true;
            }

            if (m.parent.parent === null || m.parent == m) {
                console.log('break')
                break;
            }
            vis[m.id] = true;
            m = module.parent;

        } ;
        return Object.keys(pt);

    });
}
var commentRe = /^\/\/ (.*)/;
var varRe = /^\@([^\:]*):\s*(.*);/;
var skip = /^\s*$/;
var unitRe = /(.*)(px|%|em|in|cm|mm|ex|pt|pc|px)$/;
var color = /^(#|darken\(|lighten\(|rgb\(|rgba\(|hsl\(|hsla\()([^)]*)/;
CssFactory.prototype.default_imports = ["reset.less",
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
    "utilities.less"];

/**
 * Generates the css schema for
 * @param vars
 */
CssFactory.prototype.schemaFor = function (vars) {
    vars = vars || this.variables;
    var schema = {};
    _u(vars).each(function (v, k) {
        _u(v).each(function (vv, kk) {
            schema[kk] = {
                type:color.test(vv) ? 'ColorEditor' : unitRe.test(vv) ? 'UnitEditor' : 'PlaceholderEditor',
                placeholder:vv
            }
        }, this);
    }, this);
    return schema;
}
/**
 * Geneates the fieldsets.
 * @param vars
 */
CssFactory.prototype.fieldsets = function (vars) {
    vars = vars || this.variables;
    var fieldsets = [];
    _u(vars).each(function (v, k) {
        fieldsets.push({legend:inflection.titleize(inflection.humanize(k)), fields:Object.keys(v)})
    }, this)

    return fieldsets;
};
/**
 * Reads the variables from an array of lines, presumabley from
 * a less variables file.
 * @param lines
 */
CssFactory.prototype.readVariables = function (lines, ret, file) {
    var label;
    ret = ret || {};
    var obj = {};
    var lastLine = false;
    while (lines.length) {

        var line = lines.shift();
        if (skip.test(line))
            continue;
        else if (commentRe.test(line) & !lastLine) {
            lastLine = true;
            label = line.replace(commentRe, '$1');
            obj = ret[label] = {};
        } else if (varRe.test(line)) {
            var vals = varRe.exec(line);
            obj[vals[1]] = vals[2];
            lastLine = false;
        }
    }
    return ret;
}
/**
 * Generate the imports string
 * @param imports -> array of imports.
 */
CssFactory.prototype._imports = function (imports) {
    var str = [];
    _u(imports).each(function onImport(v, k) {
        str.push('@import "' + v + '";\n');
    });
    return str;

}
/**
 * creates css
 * @param imports - an array of imports to be used.
 * @param variables - additional variables to include
 * @param onCreate - callback onCreate(err, result) result = { created:<timestamp>,css:<css string>, chekcsum:<sha1 checksum>
 */
CssFactory.prototype.createCss = function (onCreate, variables, imports) {

    var str = this._imports(imports || this.default_imports);
    _u(variables).each(function onBodyPost(k, v) {
        if (v && k && _u.isString(v) && _u.isString(k))
            str.push('@' + v + ': ' + k + ';\n');
    });

    var shasum = crypto.createHash('sha1');
    var parser = new (less.Parser)({
        paths:this.paths
    });


    parser.parse(str.join(''), function (err, tree) {
        if (err) {
            onCreate(err);
        } else {
            try {
                var css = tree.toCSS();
                shasum.update(css);
                var checksum = shasum.digest('hex');
                onCreate(null, {
                    created:Date.now(),
                    css:css,
                    checksum:checksum
                });
            } catch (e) {
                onCreate(e);
            }
        }
    });

};
module.exports = CssFactory;