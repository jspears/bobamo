define([
    'underscore',
    'Backbone',
    'views/modeleditor/admin/property',

    'views/modeleditor/admin/fieldset',
    'modeleditor/js/form-model',
    'libs/bobamo/edit',
    'modeleditor/js/inflection',
    'backbone-modal',
    'text!${pluginUrl}/templates/admin/edit.html',
    'libs/editors/filter-editor',
    'libs/editors/typeahead-editor'


], function (_, Backbone, Property, Fieldset, Form, EditView, inflection, Modal, template) {
    "use strict";

    function onModel(body) {
        var editors = {};
        var model = _.extend({schema:{}}, body.display, _.omit(body, 'schema'));

        function onPath(obj) {
            return function (v, k) {

                var p = _.omit(v, 'persistence', 'editor');
                var schemaType = ( v.persistence || v).schemaType ;
                var editor = _.omit(v.editor && v.editor[v.type], 'editor');
                var persistence = v.persistence ? _.omit(v.persistence[schemaType], 'persistence', 'editor') : {};
                var nobj = obj[v.name] = _.extend({schemaType:schemaType}, p, editor, _.omit(persistence, 'validators'));

                var paths = nobj.schema;
                delete nobj.schema;

                if (v.type)
                    editors[v.type] = true;
                if (v.multiple) {
                    nobj.listType = v.schemaType;
                    if (!nobj.type) nobj.type = 'List';
                }
                if (schemaType == 'Object')
                    return   _.each(paths, onPath((nobj.subSchema = {})));

                if (persistence.validators) {
                    nobj.validators = _.map(persistence.validators, function (vv, kk) {
                        var type = vv.type;
                        return _.extend({type:type, message:vv.message}, vv.configure[type]);
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

    var Display = Backbone.Model.extend({
        schema:{
            "title":{"title":"Title", "help":"The title of the object singular", "type":"Text"},
            "plural":{
                "title":"Plural",
                "help":"The plural of the object",
                "type":"Text"
            },
            "hidden":{"title":"Hidden", "help":"Is this object hidden?", "type":"Checkbox"},
            "labelAttr":{"title":"Label Attribute", "help":"This is a label that gives a succinct description of object, dot notation can be used"}
        },
        fields:['title', 'plural', 'hidden', 'labelAttr'],
        createForm:function (opts) {
            var form = this.form = new Form(opts);
            var pform = opts.pform;
            if (pform && pform.fields.modelName) {
                var onModelName = function () {
                    var modelName = pform.fields.modelName.getValue()
                    form.fields.title.editor.$el.attr('placeholder', inflection.titleize(inflection.humanize(modelName)));
                    form.fields.plural.editor.$el.attr('placeholder', inflection.titleize(inflection.pluralize(inflection.humanize(modelName))));
                }
                pform.on('modelName:change', onModelName);
                pform.on('render', onModelName);
                pform.on('paths:change', function () {
                    //update
                    var value = _.map(pform.fields.schema.getValue(), function (v) {
                        return {schemaType:v.persistence.schemaType, name:v.name};
                    });
                    var $el = form.fields.labelAttr.editor.$el;
                    if (!( value || value.length)) {
                        $el.removeAttr('placeholder');
                    } else {
                        var pv = _.pluck(_.where(value, {schemaType:'String'}), 'name');
                        if (pv.length) {
                            var labelAttr = ((~pv.indexOf('name') && 'name') || (~pv.indexOf('label') && 'label') || (~pv.indexOf('description') && 'description') || pv[0]);
                            $el.attr('placeholder', labelAttr);
                        }
                    }

                });
            }

            return form;
        }
    });

    var Model = Backbone.Model.extend({
        schema:{
            "modelName":{
                "title":"Model Name",
                "help":"The model name of the object",
                "type":"FilterText",
                filter:/^[a-zA-Z_]([a-zA-Z0-9,_,-,$])*$/,
                validators:['required']
            },
            description:{
                title:'Description',
                help:'A description of the model for documentation',
                type:'TextArea'
            },

            display:{
                type:'NestedModel',
                model:Display
            },
            "schema":{
                type:'List',
                itemType:'NestedModel',
                model:Property,
                title:'Properties',
                help:'This is where you add properties to this object.'
            },
            fieldsets:{
                type:'List',
                title:'Edit View',
                help:'Fields to allow editing',
                itemType:'NestedModel',
                model:Fieldset
            },
            list_fields:{
                type:'List',
                itemType:'TypeAhead',
                options:[],
                title:'List View',
                help:'Fields to show in list views'
            }
        },
        urlRoot:"${pluginUrl}/admin/backbone/",
        save:function () {
            var data = this.presave();
            var arr = _.toArray(arguments);
            arr.splice(0, 1, data);
            Backbone.Model.prototype.save.apply(this, arr);
        },

        parse:function (resp) {
            var model = resp.payload;
            var paths = model.schema;
            delete model.schema;
            var npaths = (model.schema = []);

            function fixPaths(p) {
                return function (v, k) {
                    if (!v.name)
                        v.name = k;
                    p.push(v);
                    var model = resp.payload;
                    var display = {
                        labelAttr:model.labelAttr,
                        title:model.title,
                        help:model.help,
                        plural:model.plural,
                        hidden:model.hidden || model.display == 'none'
                    };
                    delete model.labelAttr;
                    delete model.title;
                    delete model.help;
                    delete model.plural;
                    delete model.hidden;

                    _.extend(model.display || (model.display = {}), display);
                    v.multiple = v.type == 'Array' || v.multiple;

                    if (v.ref) {
                        v.schemaType = 'ObjectId';
                    } else if (!v.schemaType)
                        v.schemaType = 'Object';
                    var persistence = (v.persistence = {schemaType:v.schemaType})[v.schemaType] = v;

                    if (v.validators && v.validators.length) {
                        v.validators = _.map(v.validators, function (v, k) {
                            var ret = {
                                type:v.type,
                                message:v.message,
                                configure:{}
                            }
                            ret.configure[v.type] = _.omit(v, 'type', 'message')
                            return ret;
                        });
                    }

                    (v.editor || (v.editor={}))[v.type] = _.omit(v, 'persistence', 'subSchema', 'schema', 'schemaType','title','plural', 'labelAttr','title','help','plural','validators','hidden');
                    if (v.subSchema) {
                        var sub = v.subSchema;
                        v.schemaType = 'Object';
                        delete v.subSchema;
                        var np = (v.schema = []);
                        _.each(sub, fixPaths(np));
                    }
                }

            }

            _.each(paths, fixPaths(npaths));
            return model;
        },

        defaults:{
            hidden:false
        },
        idAttribute:'modelName'
    });

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
        events:_.extend({
            'click .preview':'onPreviewClick',
            'click .previewSchema':'onPreviewSchema'
        }, EditView.prototype.events),
        fieldsets:[
            {legend:'Model Info', fields:['modelName', 'description']},
            {legend:'Properties', fields:['schema']},
            {legend:'Display', fields:['display']},
            {legend:'Views', fields:['fieldsets', 'list_fields']}
        ],
        template:_.template(template),
        model:Model,
        render:function (opts) {
            opts = opts || {};
            opts.modelName = opts.id;
            EditView.prototype.render.apply(this, Array.prototype.slice.call(arguments, 0));
            return this;
        },
        wizOptions:{
            fieldset:'> div.form-container > form.form-horizontal > fieldset'
        },
        onPreviewSchema:function () {
            var model = this.presave()
            var content = JSON.stringify(model, null, "\t");
            var rows = content.split("\n").length;
            new Modal({
                content:'<textarea style="width:100%;height:100%;overflow: hidden;" rows="' + rows + '">' + content + '</textarea>',
                title:'Schema Preview of [' + model.modelName + ']',
                animate:true
            }).open();
            return false;
        },
        previewCB:function (model) {
            return _.bind(function (resp) {
                var View = EditView.extend({
                    fieldsets:model.fieldsets || {
                        fields:_.keys(model.schema)
                    },
                    template:_.template(resp),
                    collection:new Backbone.Collection(),
                    model:Backbone.Model.extend(model),
                    onSave:function () {
                        var errors = this.form.validate();
                        if (!errors)
                            alert('Save is unavailable in preview')
                        return false;
                    },
                    config:{
                        title:model.title,
                        plural:model.plural,
                        modelName:model.modelName
                    }
                });


                require(model.includes, function () {
                    new Modal({
                        content:new View(),
                        animate:true
                    }).open();
                })
            }, this);
        },
        presave:function () {


            var model = onModel(this.form.getValue());
            if (model.fieldsets && !model.fieldsets.length)
                model.fieldsets = [
                    {fields:_.keys(model.schema)}
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
        onSuccessRefresh:function (resp) {
            this.onSuccess.apply(this, _.toArray(arguments));
            if (resp.status == 0)
                new Modal({
                    title:'Save Success',
                    content:'<h2>To view changes press ok to refresh browser</h2>',
                    animate:true
                }).open(function () {
                        window.location.hash = "";
                        window.location.reload();
                    });
        },
        onSave:function (e) {
            e.preventDefault();
            $('.error-list').empty().hide();
            $('.success-list').empty().hide();
            console.log('changed', this.form.model.changed);
            this.form.validate();
            var errors = this.form.commit();
            var save = this.presave();
            if (!(errors)) {
                $.ajax({
                    url:'${pluginUrl}/admin/backbone',
                    type:'PUT',
                    data:save,
                    success:_.bind(this.onSuccessRefresh, this)

                });
                //this.form.model.save(save, {error:this.onError});
            } else if (errors) {
                this.onError(this.form.model, errors);
            }

        },
        onPreviewClick:function (e) {
            e.preventDefault();

            var model = this.presave()
            console.log('click preview', model);
            var url = "${baseUrl}templates/" + model.modelName + "/edit.html";
            $.ajax({
                type:'POST',
                url:url,
                data:model,
                success:this.previewCB(model),
                dataType:'text'
            });

        },
        createForm:function (opts) {
            opts._root = this;
            opts.model.schema.fieldsets.model.prototype.allPaths = opts.model.schema.list_fields.options = function () {
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

            form.on('schema:add', function (c1, c2, c3) {
                console.log('value', c3.value.name);
                var editor = form.fields.list_fields.editor
                editor.addItem(c3.value.name);
            });
            form.on('schema:remove', function (c1, c2, c3) {
                var lf = form.fields.list_fields;
                //Remove each item that matches the name of the path that is being removed.   Ugly, but setValue does
                // not work, because list does not remove things from the items list.   A bug in my book, but this works.
                _.each(_.where(lf.editor.items, {value:c3.value.name}), lf.editor.removeItem, lf.editor);
            });
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
                form.$el.find('> fieldset').furthestDecendant('.controls').css({marginLeft:'160px'})
                    .siblings('label').css({display:'block'}).parents('.controls').css({marginLeft:0}).siblings('label').css({display:'none'});


                //      editor.setOptions(paths)
            })

            return form;
        },
        config:{
            title:'Model',
            plural:'Models'
        }
    });

});