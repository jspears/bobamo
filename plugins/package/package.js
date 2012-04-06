var Plugin = require('../../lib/plugin-api'), util = require('util'), inflection = require('../../lib/inflection');
var PackagePlugin = function () {
    Plugin.apply(this, arguments);
}
util.inherits(PackagePlugin, Plugin);
PackagePlugin.prototype.appModel = function () {
    try {
    var package = require(process.cwd() + '/package.json');
    }catch(e){
        console.warn('could not load package.json from '+process.cwd());
        return null;
    }
    var UIModel = {
        title:inflection.titleize(inflection.humanize(package.name)),
        version:package.version,
        description:package.description
    };
    return UIModel;
}
PackagePlugin.prototype.routes = function () {
}
PackagePlugin.prototype.filters = function () {
}

module.exports = PackagePlugin;