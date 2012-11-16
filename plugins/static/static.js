var Plugin = require('../../lib/plugin-api'), util = require('util'), path = require('path'), static = require('connect/lib/middleware/static');
var StaticPlugin = function () {
    Plugin.apply(this, arguments);
}
util.inherits(StaticPlugin, Plugin);
var editors = {
    Text:{
        types:['String', 'Boolean', 'Number', 'Date']
    },
    TextArea:{
        types:['String', 'Boolean', 'Number', 'Date']
    },
    Hidden:{
        types:['String', 'Boolean', 'Number', 'Date']
    },
    Checkbox:{
        types:['Boolean', 'String', 'Number']
    },
    Date:{
        types:['Date', 'Number', 'String']
    },
    DateTime:{
        types:['Date', 'Number', 'String']
    },
    Password:{
        types:['String']
    },
    Radio:{
        types:['Boolean', 'String']
    },
    Select:{
        types:['Array', 'Object']
    },
    MultiEditor:{
        types:['Array', 'Object']
    },
    Number:{ types:['Number', 'String']},
    Search:{ types:['ObjectId']},
    Link:{types:['ObjectId']},
    List:{types:['ObjectId']}
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