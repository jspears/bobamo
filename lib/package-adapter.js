var inflection = require('./inflection');
module.exports = (function () {
    var package = require(process.cwd() + '/package.json');
    var UIModel = {
        title:inflection.titleize(inflection.humanize(package.name)),
        version:package.version,
        description:package.description
    };
    return UIModel;
})()