var fs = require('fs'),
    path = require('path'), _u = require('underscore'),
    inflection = require('../../lib/inflection'),
    crypto = require('crypto'), less = require('less');
/**
 * CssFactory for Less
 */
function CssFactory(options) {

    this.options = _u.extend({}, options);
    this.__defineGetter__('variables', function () {
        var readp = this.options.paths;
        var vars = {};
        readp.forEach(function (v, k) {
            var varFile = path.join(v, 'variables.less')
            if (fs.existsSync(varFile))
                this.readVariables(fs.readFileSync(varFile, 'utf-8').split('\n'), vars, v);
        }, this);

        return vars;
    });
    var _default_imports = [];
    this.__defineGetter__('default_imports', function () {
        if (_default_imports.length)
            return _default_imports;
        options.paths.forEach(function (dir) {
            if (fs.existsSync(dir))
                fs.readdirSync(dir).forEach(function (f) {
                    if (/\.less$/.test(f)) {
                        _default_imports.push(f);
                    }
                });
        })
        return _default_imports;
    });

    this.__defineGetter__('paths', function () {
        var pt = {};
        var m = module;
        var vis = {};
        while (typeof vis[m.id] === 'undefined') {
            var p = path.join(path.dirname(m.filename), 'less');
            if (path.existsSync(p)) {
                pt[p] = true;
            }

            if (m.parent.parent === null || m.parent == m) {
                break;
            }
            vis[m.id] = true;
            m = module.parent;

        }
        ;
        return Object.keys(pt);

    });
    this._cache = {};
}
var commentRe = /^\/\/ (.*)/;
var varRe = /^\@([^\:]*):\s*(.*);/;
var skip = /^\s*$/;
var unitRe = /(.*)(px|%|em|in|cm|mm|ex|pt|pc|px)$/;
var color = /^(#|darken\(|lighten\(|rgb\(|rgba\(|hsl\(|hsla\()([^)]*)/;

/**
 * Generates the css schema for
 * @param vars
 */
CssFactory.prototype.schemaFor = function (vars) {
    vars = vars || this.variables;
    var schema = {
        id:{
            type:'Hidden'
        }
    };
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
   return  imports ? imports.map(function onImport(v, k) {
        return '@import "' + v + '"';
   }) : [];

}
CssFactory.prototype.createCache = function (onCreate, variables, isDefault) {
    var self = this;
    var id = variables && variables.id;
    if (id) delete variables.id;

    this.createCss(function (err, obj) {
        if (err)
            return onCreate(err);

        if (isDefault)
            self.checksum = id || obj.checksum;
        obj.id = id || obj.checksum;
        var c = self.cache(obj);
        onCreate(null, c);
    }, variables);

}
CssFactory.prototype.current = function (onSend, cacheId) {
    var c = this._cache[cacheId || this.checksum];
    if (c) {
        c.lastAccess = Date.now();
        onSend(null, c);
    } else {
        this.createCache(onSend, {}, true);
    }
    return this;
}

CssFactory.prototype.getCache = function (id) {
    return this._cache[id];
}

CssFactory.prototype.cache = function (obj) {
    return this._cache[obj.id || obj.checksum] = _u.extend({ created:Date.now()}, obj);
}
function falsy(v){
    return v;
}
/**
 * creates css
 * @param imports - an array of imports to be used.
 * @param variables - additional variables to include
 * @param onCreate - callback onCreate(err, result) result = { created:<timestamp>,css:<css string>, chekcsum:<sha1 checksum>
 */
var valRe = /^(#|px|%|em|in|cm|mm|ex|pt|pc|px)$/;
CssFactory.prototype.createCss = function (onCreate, variables, imports) {
    variables = variables || {};
    if (!variables.imports) {
        variables.imports = this.default_imports;
    }
    if (!variables.paths) {
        variables.paths = this.options.paths;
    }

    var str = this._imports(variables.imports).concat(

    _u(variables).map(function onBodyPost(k, v) {
        if (k == 'imports' || k == 'paths') return;
        if (v && k && _u.isString(v) && _u.isString(k) && !valRe.test(k))
            return '@' + v + ': ' + k;
    }));

    var shasum = crypto.createHash('sha1');
    var parser = new (less.Parser)({
        paths:variables.paths.slice(0)
    });

    var strg = str.filter(falsy).concat('').join(";\n");
    parser.parse(strg, function (err, tree) {
        if (err) {
            console.log('error parsing', strg, err);
            onCreate(err);
        } else {
            try {
                var css = tree.toCSS();
                shasum.update(css);
                var checksum = shasum.digest('hex');
                onCreate(null, {
                    created:Date.now(),
                    payload:css,
                    checksum:checksum,
                    variables:variables
                });
            } catch (e) {
                onCreate(e);
            }
        }
    });

};
module.exports = CssFactory;