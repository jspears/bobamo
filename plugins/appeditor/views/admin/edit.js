define([
    'underscore',
    'Backbone',
    'libs/bobamo/edit',
    'text!appeditor/views/templates/admin/edit.html',
    'libs/editors/multi-editor'
], function (_, Backbone, EditView, template) {
    "use strict";

    var schema = {
        title: {help: 'Application Title'},
        version: {help: 'Version of application'},
        description: {},
        authors: {
            type: 'List',
            help: 'People who have contributed, email "Justin Spears" &lt;speajus@gmail.com&gt;'
        }
    };
    var Model = Backbone.Model.extend({
        schema: schema,
        url: '${pluginUrl}/admin',
        parse: function (resp) {
            console.log('response', resp);
            return resp.payload;
        },
        idAttribute: 'app',
        get: function (key) {
            if (key && key.indexOf('.') > -1) {
                var split = key.split('.');
                var val = this.attributes;
                while (split.length && val)
                    val = val[split.shift()];

                return val;
            }
            return Backbone.Model.prototype.get.call(this, key);
        }

    });

    var authors//${nl()} = {{json appModel.authors || []}};
    return EditView.extend({
        fieldsets: [
            {legend: 'Application', fields: ['title', 'version', 'description']},
//            {'legend':'Models', fields:['models']},
//            {'legend': 'Plugins', fields:['plugins']},
            {'legend': 'Authors', fields: ['authors']}
        ],
        buttons: _.omit(EditView.prototype.buttons, 'left'),
        template: _.template(template),
        model: Model,
        isWizard: true,
        config: {
            title: 'App',
            plural: 'App',
            modelName: 'app'
        },
        createModel: function () {
            return new Model({
                title: '${appModel.title}',
                description: '${appModel.description}',
                version: '${appModel.version}',
                build: '${appModel.build}',
//                models:{{json Object.keys(appModel.modelPaths) }},
//                plugins:{{json pluginManager.pluginNames()}},
                authors: authors
            });
        }
    });
});
