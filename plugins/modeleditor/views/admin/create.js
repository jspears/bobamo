define([
    'underscore',
    'Backbone',
    'modeleditor/views/admin/model-model',
    'Backbone.Form/form-model',
    'libs/bobamo/edit',
    'libs/util/inflection',
    'backbone-modal',
    'text!modeleditor/views/templates/admin/edit.html',
    'libs/editors/filter-editor',
    'libs/editors/typeahead-editor'


], function (_, Backbone, Model, Form, EditView, inflection, Modal, template) {
    "use strict";

    function onModel(body) {
        var editors = {};
        var model = _.extend({schema: {}}, body.display, _.omit(body, 'schema'));

        function onPath(obj) {
            return function (v, k) {

                var p = _.omit(v, 'persistence', 'editor');
                var schemaType = ( v.persistence || v).schemaType;
                var editor = _.omit(v.editor && v.editor[v.type], 'editor');
                var persistence = v.persistence ? _.omit(v.persistence[schemaType], 'persistence', 'editor') : {};
                var nobj = obj[v.name] = _.extend({schemaType: schemaType}, p, editor, _.omit(persistence, 'validators'));

                var paths = nobj.schema;
                delete nobj.schema;

                if (v.type)
                    editors[v.type] = true;
                if (v.multiple) {
                    nobj.listType = v.schemaType;
                    nobj.type = 'List';
                    if (obj.type)
                        nobj.itemType = nobj.type
                }
                if (schemaType == 'Object')
                    return   _.each(paths, onPath((nobj.subSchema = {})));

                if (persistence.validators) {
                    nobj.validators = _.map(persistence.validators, function (vv, kk) {
                        var type = vv.type;
                        return _.extend({type: type, message: vv.message}, vv.configure[type]);
                    });
                }
            }

        }

        _.each(body.schema, onPath(model.schema));

        model.includes = _.map(_.omit(editors, _.keys(Form.editors)), function (v, k) {
            return 'libs/editors/' + inflection.hyphenize(k)

        });
        model.modelName = body.modelName;
        return model;

    }


    function schemaWalk(schema, callback) {
        _.each(schema, function (v, k) {
            if (callback(v, k) === false)
                return;
            if (v.subSchema) {
                schemaWalk(v.subSchema, callback)
            }
        })
    }

    return EditView.extend({
        events: _.extend({
            'click .preview': 'onPreviewClick',
            'click .previewSchema': 'onPreviewSchema'
        }, EditView.prototype.events),
        fieldsets: [
            {legend: 'Model Info', fields: ['modelName', 'description']},
            {legend: 'Properties', fields: ['schema']},
            {legend: 'Display', fields: ['display']}
        ],
        template: _.template(template),
        model: Model,
        render: function (opts) {
            opts = opts || {};
            opts.modelName = opts.id;
            EditView.prototype.render.apply(this, Array.prototype.slice.call(arguments, 0));
            return this;
        },
        wizOptions: {
            fieldset: '> div.form-container > form.form-horizontal > fieldset'
        },
        onPreviewSchema: function () {
            var model = this.presave()
            var content = JSON.stringify(model, null, "\t");
            var rows = content.split("\n").length;
            new Modal({
                content: '<textarea style="width:100%;height:100%;overflow: hidden;" rows="' + rows + '">' + content + '</textarea>',
                title: 'Schema Preview of [' + model.modelName + ']',
                animate: true
            }).open();
            return false;
        },
        previewCB: function (model) {
            return _.bind(function (resp) {
                var View = EditView.extend({
                    fieldsets: model.fieldsets || {
                        fields: _.keys(model.schema)
                    },
                    template: _.template(resp),
                    collection: new Backbone.Collection(),
                    model: Backbone.Model.extend(model),
                    onSave: function () {
                        var errors = this.form.validate();
                        if (!errors)
                            alert('Save is unavailable in preview')
                        return false;
                    },
                    config: {
                        title: model.title,
                        plural: model.plural,
                        modelName: model.modelName
                    }
                });


                require(model.includes, function () {
                    new Modal({
                        content: new View(),
                        animate: true
                    }).open();
                })
            }, this);
        },
        presave: function () {


            var model = onModel(this.form.getValue());
            if (model.fieldsets && !model.fieldsets.length)
                model.fieldsets = [
                    {fields: _.keys(model.schema)}
                ];
            else
                _.each(model.fieldsets, function (fieldset) {
                    var fields = fieldset.fields || fieldset || [];
                    var idx;
                    while (~(idx = fields.indexOf(null)) && fields.splice(idx, 1).length);
                });


            console.log('postfixup', model);
            return model;
        },
        onSuccessRefresh: function (resp) {
            this.onSuccess.apply(this, _.toArray(arguments));
            if (resp.status == 0)
                new Modal({
                    title: 'Save Success',
                    content: '<h2>To view changes press ok to refresh browser</h2>',
                    animate: true
                }).open(function () {
                        window.location.hash = "";
                        window.location.reload();
                    });
        },
        url: '${pluginUrl}/admin/backbone',
        onSave: function (e) {
            e.preventDefault();
            $('.error-list').empty().hide();
            $('.success-list').empty().hide();
            console.log('changed', this.form.model.changed);
            this.form.validate();
            var errors = this.form.commit();
            var save = this.presave();
            if (!(errors)) {
                $.ajax({
                    url: this.url,
                    type: 'PUT',
                    data: save,
                    success: _.bind(this.onSuccessRefresh, this)

                });
                //this.form.model.save(save, {error:this.onError});
            } else if (errors) {
                this.onError(this.form.model, errors);
            }

        },
        onPreviewClick: function (e) {
            e.preventDefault();

            var model = this.presave()
            console.log('click preview', model);
            var url = "${baseUrl}templates/" + model.modelName + "/edit.html";
            $.ajax({
                type: 'POST',
                url: url,
                data: model,
                success: this.previewCB(model),
                dataType: 'text'
            });

        },
        listUrl: function () {
            return '#/modeleditor/views/admin/list';
        },
        createForm: function (opts) {
            opts._root = this;
            opts.model.schema.fieldsets.model.prototype.allPaths = function () {
                var paths = [];

                function onPathFux(prev) {
                    return function (v) {
                        var path = v.path || _.isUndefined(prev) ? v.name : [prev, v.name].join('.');
                        paths.push(path);
                        var dPaths = v.persistence && v.persistence[v.type] && v.persistence[v.type].schema
                        _.each(dPaths, onPathFux(path))

                    }
                }


                var json = form.getValue();

                _.each(json.schema, onPathFux());//getValue()
                return paths;
                //console.log('paths',paths);
                // _.each(editor.items, function(v){v.editor.setOptions(paths)});
            }
            var form = this.form = new Form(opts);

            function enabled(e) {
                console.log('enabled', e);
                var modelName = form.fields.modelName.getValue()
                if (modelName && modelName.trim().length) {
                    form.fields.schema.$el.find('button').removeAttr('disabled');
                } else {
                    form.fields.schema.$el.find('button').attr('disabled', 'true');
                }

            }

            form.on('modelName:change', enabled);

            var self = this;
            var retry = 0;
            var first = false;
            var onValidModelName = function () {
                var $wiz = self.$el.find('> .edit-form > .wiz');
                var wiz = $wiz.data('wiz');
                //todo figure out how to know when the wiz is done.  but until then
                if (!(wiz || retry++ > 3)) {
                    setTimeout(onValidModelName, 100 * retry);
                    return false;
                }
                if (!wiz)
                    return;
                if (!first) {
                    first = true;
                    wiz.$next.on('click', onValidModelName);
                }
                var val = true;
                if (wiz.current == 0)
                    val = !!form.fields.modelName.getValue();
                else if (wiz.current == 1)
                    val = !!form.fields.schema.editor.items.length;


                if (!val) {
                    wiz.$next.attr('disabled', 'disabled');
                } else {
                    wiz.$next.removeAttr('disabled');
                }

            }
            form.on('all', function () {
                console.log('all', arguments)
            })
            form.on('schema:change', onValidModelName);
            form.on('modelName:change', onValidModelName)

            form.on('render', function () {
                enabled();
                onValidModelName();
//                setTimeout(onValidModelName,200);
                form.$el.find('> fieldset').furthestDecendant('.controls').css({marginLeft: '160px'})
                    .siblings('label').css({display: 'block'}).parents('.controls').css({marginLeft: 0}).siblings('label').css({display: 'none'});


                //      editor.setOptions(paths)
            })

            return form;
        },
        config: {
            title: 'Model',
            plural: 'Models'
        }
    });

});