var Plugin = require('../../lib/plugin-api'), util = require('util'), path = require('path'), static = require('connect/lib/middleware/static');
var StaticPlugin = function () {
    Plugin.apply(this, arguments);
}
util.inherits(StaticPlugin, Plugin);
var editors = [
    {
        name:'Text',
        types:['String', 'Boolean', 'Number', 'Date']
    },
    {
        name:'TextArea',
        types:['String', 'Boolean', 'Number', 'Date']
    },
    {
        name:'Hidden',
        types:['String', 'Boolean', 'Number', 'Date']
    },
    {   name:'Checkbox',
        types:['Boolean', 'String', 'Number']
    },
    {   name:'Date',
        types:['Date', 'Number', 'String']
    },
    {   name:'DateTime',
        types:['Date', 'Number', 'String']
    },
    {
        name:'Password',
        types:['String']
    },
    {
        name:'Radio',
        types:['Boolean', 'String']
    },
    {
        name:'Select',
        types:['Array', 'Object']
    },
    {
        name:'MultiEditor',
        types:['Array', 'Object']
    },
    {   name:'Number',
        types:['Number', 'String']
    },
    { name:'Search', types:['ObjectId']},
    { name:'Link', types:['ObjectId']},
    { name:'List', types:['ObjectId']}
];

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