define(['underscore', 'Backbone.Form', 'libs/bobamo/edit',
    'csvimport/configure-model',
    'text!csvimport/templates/configure.html',
    'libs/jquery/jquery.busy', 'backbone-modal'], function (_, Form, EditView, ConfModel, template) {

    return EditView.extend({
        template: _.template(template),
        initialize: function (opts) {
            if (opts.model) {
                opts.model.on('change', this.onModelChange, this);
                opts.model.fetch()

            }
        },
        save:function(){
          return  EditView.prototype.save.call(this, this.presave());
        },
        presave: function () {
            var results = this.form.getValue();
            results.mapping = _.map(this.form.fields.mapping.editor.items, function (itm) {
                var v = itm.getValue();
                var parsers = v.parser && v.parser.parsers;
                var type = v.parser && v.parser.type;
                if (parsers)
                    v.options = parsers[type];
                if (type)
                    v.parser = type;
                return v;
            });
            return results;
        },
        onModelChange: function () {
            this._update();
        },
        createModel: function () {
            return this.model;
        },
        onFileChange: function (e) {
            console.log('onFileChange', e);
            var $fel = this.form.$el;
            $fel.busy({
                img: 'img/ajax-loader.gif',
                title: 'Uploading File...'
            });
            this._uploading = true;
            $fel.iframePostForm({
                complete: _.bind(function (resp) {
                  //  this.model.set(resp.payload);
                   this._update();
                }, this),
                json: true
            });

            $fel.attr('enctype', 'multipart/form-data');
            $fel.attr('method', 'POST');
            $fel.attr('action',
                window.location.origin +
                    "${pluginUrl}/admin/configure/" + this.model.get('modelName'));
            $fel.submit();
            var self = this;
            var intI = setInterval(function () {
                if (self._uploading)
                    return;
                clearInterval(intI);
                $fel.busy('remove')

            }, 500);
        },
        _update: function (resp) {
            console.log('_update', resp);
            var mapping = this.model.get('mapping');
            var me = this.form.fields.mapping.editor;
            _.each(me.items, me.remove, me);
            me.items = [];
//            _.invoke(me.items, 'remove');
            if (mapping)
                _.each(mapping.sort(function (a, b) {
                    if (!a) return -1;
                    if (!b) return 1;
                    return a.colIndex - b.colIndex;

                }), me.addItem, me);
            this._uploading = false;
        },
        events: _.extend({
            "change input[type=file]": 'onFileChange'
        }, EditView.prototype.events),
        createForm: function (opts) {
            var data = this.options.data;

            var form = this.form = new Form(_.extend({}, opts, {data: data}));
            var self = this;
            form.on('render', function () {
                self.trigger('render')
            }, this);
            return form;

        },
        model: ConfModel,
        fieldsets: [
            {
                legend: 'Import',
                fields: ['configuration', 'file']
            },
            {
                legend: 'Mappings',
                fields: ['mapping']
            }
        ], isWizard: true
    })


});