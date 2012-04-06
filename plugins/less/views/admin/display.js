define(['underscore', 'jquery', 'Backbone', 'libs/bobamo/edit', 'text!${pluginUrl}/templates/admin/display.html', 'jquery-ui',
    'libs/backbone-forms/src/jquery-ui-editors', 'libs/editors/unit-editor', 'libs/editors/color-editor', 'libs/editors/placeholder-editor'], function (_, $, Backbone, EditView, template) {

    var fieldsets = {{html JSON.stringify(lessFactory.fieldsets())}};
    var schema = {{html JSON.stringify(lessFactory.schemaFor())}};
    var id = '${lessFactory.checksum}';
    var Model = Backbone.Model.extend({
        schema:schema,
        urlRoot:'less/admin',
        parse:function (resp) {
            console.log('response', resp);
            return resp.payload && resp.payload.variables || resp.payload || resp;
        },
        idAttribute:'id',
        get:function (key) {
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
        fieldsets:fieldsets,
        template:_.template(template),
//        collection:collection,
        model:Model,
        isWizard:true,

        events:{
            'click .preview':'onPreview',
            'click .save':'onInstall',
            'click .default':'onDefault'
        },
        onDefault:function () {
            console.log('default')
            $.ajax({data:{install:true}, type:'POST', url:'less/admin', success:this.onSuccess, error:this.onError});
        },
        onInstall:function (e) {
            console.log('onInstall', this.model, this.model.set);

            this.form.model.set('install', true);
            this.onSave(e);
        },
        onPreview:function () {
            var self = this;
            var save = this.form.getValue();
            this.form.model.save(save, {success:function onPreviewSave(obj) {
                require([ 'text!${pluginUrl}/templates/admin/preview.html', 'libs/bootstrap/js/bootstrap-modal'], function (preview) {
                    var template = _.template(preview, {title:'Display Changes', previewUrl:'${baseUrl}index.html?checksum=' + obj.id});

                    var $modal = $(template);
                    $('.save', $modal).on('click', $.proxy(self.onSave, self));
                    $modal.modal().on('hidden', function () {
                        $(this).remove();
                    });
                    $('body').append($modal)
                });
            }});
        },
        onSuccess:function (resp, obj) {
            EditView.prototype.onSuccess.call(this, resp, obj);
            setTimeout(function () {
                window.location.reload();
            }, 1000);

        },
        render:function (obj) {
            if (obj) obj.id = id;
            EditView.prototype.render.apply(this, Array.prototype.slice.call(arguments));
        },
        config:{
            title:'Display',
            plural:'Display Variables',
            modelName:'less'
        }
    });

});