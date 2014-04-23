define(['underscore', 'jquery', 'Backbone', 'libs/bobamo/edit', 'text!less/views/templates/admin/display.html', 'libs/editors/unit-editor', 'libs/editors/color-editor', 'libs/editors/placeholder-editor'], function (_, $, Backbone, EditView, template) {

    var fieldsets//${nl()} = {{json lessFactory.fieldsets() }};
    if (!fieldsets) fieldsets = {};
    var schema//${nl()} = {{json lessFactory.schemaFor()}};
    if (!schema)
        schema = {};
    var Model = Backbone.Model.extend({
        schema: schema,
        urlRoot: 'less/admin',
        //${nl()} defaults:{{json (plugin.conf.variables || {}) }},
        parse: function (resp) {
            console.log('response', resp);
            return resp.payload && resp.payload.variables || resp.payload || resp;
        },
        idAttribute: 'id',
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
    return EditView.extend({
        fieldsets: fieldsets,
        template: _.template(template),
//        collection:collection,
        model: Model,
        isWizard: true,
        buttons: _.omit(EditView.prototype.buttons, 'left','right'),
        events: {
            'click .preview': 'onPreview',
            'click .save': 'onInstall',
            'click .default': 'onDefault'
        },
        onDefault: function () {
            $.ajax({data: {install: true}, type: 'POST', url: 'less/admin', success: this.onSuccess, error: this.onError});
        },
        onInstall: function () {
            console.log('onInstall', this.model, this.model.set);

            this.form.model.set('install', true);
            this.onSave();
        },
        onPreview: function () {
            var onSave = _.bind(this.onSave, this);
            var save = this.form.getValue();
            this.form.model.save(save, {success: function onPreviewSave(obj, resp) {
                require([ 'text!${pluginUrl}/templates/admin/preview.html', 'backbone-modal'], function (preview, Modal) {
                    new Modal({
                        content: '<iframe src="${baseUrl}index.html?checksum=' + resp.payload.id + '" style="width:100%;height:100%;border:none;"></iframe>',
                        title: 'Display Changes',
                        animate: true
                    }).open(onSave)
                });
            }});
        },
        onSuccess: function (resp, obj) {
            EditView.prototype.onSuccess.call(this, resp, obj);
            setTimeout(function () {
                window.location.reload();
            }, 1000);

        },
//        render: function (obj) {
//            if (obj) id = id;
//            EditView.prototype.render.apply(this, Array.prototype.slice.call(arguments));
//        },
        config: {
            title: 'Display',
            plural: 'Display Variables',
            modelName: 'less'
        }
    });

});