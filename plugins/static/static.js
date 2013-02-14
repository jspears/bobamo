var Plugin = require('../../lib/plugin-api'), editors = require('./editors'),
    util = require('util'), path = require('path'), static = require('connect/lib/middleware/static'), _u = require('underscore');
var StaticPlugin = function (options, app, name, p, pluginManager) {
    Plugin.apply(this, arguments);
    var public = path.join(this.path, 'public', 'js')
    _u.extend(this.pluginManager.requireConfig.paths, {
        underscore:path.join(public, 'libs/underscore/underscore-1.4.2'),
        Backbone:path.join(public, 'libs/backbone/backbone-0.9.2'),
        'jquery-ui':path.join(public, 'libs/backbone-forms/editors/jquery-ui'),
        'Backbone.Form':path.join(public, 'libs/bobamo/backbone-forms'),
        'Backbone.FormOrig':path.join(public, 'libs/backbone-forms/backbone-forms'),
        'jquery-editors':path.join(public, 'libs/backbone-forms/editors/list'),
        'bootstrap':path.join(public, 'libs/bootstrap/js'),
        templates:path.join(public, '../templates'),
        'backbone-modal':path.join(public, 'libs/backbone-forms/editors/backbone.bootstrap-modal'),
        'libs':path.join(public, 'libs')
    });
}
util.inherits(StaticPlugin, Plugin);
StaticPlugin.prototype.renderers = function(){ return require('./renderers') };
var formatters = [
    {name:'Text',
        schema:{
            default:'Text',
            labelAttr:'Text',
            maxLength:'Number'
        }
    },
    {
        name:'Number',
        types:['Number'],
        schema:{
            numberFormat:{
                type:'Text',
                placeholder:'##.#'
            }

        }
    },
    {
        name:'Date',
        types:['Date', 'DateTime'],
        schema:{
            dateFormat:'Text'
        }
    },
    {
        name:'Password',
        schema:{
            showAs:{
                type:'Select',
                options:['******', 'Text', 'None']
            }
        }
    },
    {
        name:'List',
        types:['List', 'Array'],
        schema:{
            labelAttr:'Text',
            count:{
                type:'Radio',
                options:['None', 'count', 'delimited']
            }
        }
    }
]
StaticPlugin.prototype.format = function (obj) {
    if (obj) {
        var val = obj.name || obj;
        return _u.filter(formatters, function (v) {
            return !v.types || ~v.types.indexOf(val);
        });

    }
    return formatters;

}
StaticPlugin.prototype.editors = function () {
    return editors;
}
StaticPlugin.prototype.filters = function () {
    var prefix = this.baseUrl;
    var sdir = path.join(this.path, 'public');
    var psdir = path.join(process.cwd(), 'public');

    var public = static(sdir);
    var publicUser = static(psdir);
    console.log("Public Dir: ", psdir);
    this.app.get(prefix + '*', function (req, res, next) {
        req._url = req.url;
        req.url = req.url.substring(prefix.length - 1);

        next();

    }, publicUser, public, function (req, res, next) {
        req.url = req._url;
        next();
    });
}
StaticPlugin.prototype.routes = function () {
}
module.exports = StaticPlugin;