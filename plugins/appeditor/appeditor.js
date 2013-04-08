var bobamo = require('../../index'), Plugin = bobamo.PluginApi, Model = bobamo.DisplayModel, _u = require('underscore');
var AppEditorPlugin = function (options, app, name) {
    Plugin.apply(this, arguments);
    this.conf = {};
};

require('util').inherits(AppEditorPlugin, Plugin);

AppEditorPlugin.prototype.admin = function () {
    var appModel = this.pluginManager.appModel;
    return  new Model('appeditor', {
        schema: {
            title: {help: 'Application Title', validators: [
                {type: 'required'}
            ]},
            version: {type: 'Text', help: 'Version of application'},
            description: {
                type: 'TextArea'
            },
            authors: {
                type: 'List',
                help: 'People who have contributed, email "Justin Spears" &lt;speajus@gmail.com&gt;'
            }
        },
        buttons: {
            left: []
        },
        title: 'About',
        defaults: {
            title: appModel.title,
            version: appModel.version,
            description: appModel.description,
            authors: this.conf.authors
        }
    });
}

AppEditorPlugin.prototype.appModel = function () {
    return this.conf;
};

AppEditorPlugin.prototype.configure = function (conf) {

    conf = conf || {};
    var appModel = this.pluginManager.appModel;
    if (this.conf) {
        conf.revisions = this.conf.revisions;
    } else {
        conf.revisions = [];
    }
    var cversion = appModel.version || this.conf && this.conf.version;
    if (conf.version != cversion) {
        var revisions = conf.revisions || (conf.revisions = []);
        revisions.push({
            version: appModel.version,
            description: appModel.description,
            modified: appModel.modified || new Date(),
            timestamp: appModel.timestamp
        });
    }
    Plugin.prototype.configure.call(this, conf);
    var errors;
    if (!conf.title) {
        if (!errors)
            errors = {};
        errors.title = 'Is required';
    }
    if (!conf.description) {
        if (!errors)
            errors = {};
        errors.description = 'Is required';
    }
    return errors;
}

module.exports = AppEditorPlugin;
