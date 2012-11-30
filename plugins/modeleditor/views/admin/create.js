define([
    'underscore',
    'Backbone',
    'views/modeleditor/admin/property',

    'views/modeleditor/admin/fieldset',
    'modeleditor/js/form-model',
    'libs/bobamo/edit',
    'modeleditor/js/inflection',
    'backbone-modal',
    'text!${pluginUrl}/templates/admin/edit.html'

], function (_, Backbone, Property, Fieldset, Form, EditView, inflection, Modal, template) {
    "use strict";

    function onModel(body) {
        var editors = {};
        var model = _.extend({schema:{}}, body.display, _.omit(body, 'paths'));

        function onPath(obj) {
            return function (v, k) {

                  var p = _.omit(v, 'persistence');
                var schemaType = v.persistence.schemaType;
                var persistence  = v.persistence[schemaType];
                var nobj = obj[v.name] = _.extend({schemaType:schemaType}, p, persistence);
                var paths = nobj.paths;
                delete nobj.paths;

                if (v.type)
                    editors[v.type] = true;
                if (v.multiple){
                    nobj.listType = v.schemaType;
                    nobj.type = 'List';
                }
                if (schemaType == 'Object')
                    return   _.each(paths, onPath((nobj.subSchema = {})));

                if (nobj.validators) {
                    nobj.validators = _.map(v.validators, function (vv, kk) {
                        return _.extend({}, _.omit(vv, 'configure'), vv.configure);
                    });
                }
            }

        }

        _.each(body.paths, onPath(model.schema));

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
                    var value = _.map(pform.fields.paths.getValue(), function (v) {
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
                "type":"Text",
                required:true
            },

            display:{
                type:'NestedModel',
                model:Display
            },
            "paths":{
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
                title:'List View',
                help:'Fields to show in list views'
            }
        },
        urlRoot:"${pluginUrl}/admin/backbone/",
        save:function () {
            var data = this.presave();
            var arr =  _.toArray(arguments);
            arr.splice(0,1,data);
            Backbone.Model.prototype.save.apply(this, arr);
        },

        parse:function (resp) {
            var model = resp.payload;
            var paths = model.paths;
            delete model.paths;
            var npaths = (model.paths = []);

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
                            var mesg = v.message || Form.validators.errMessages[v.type];
                            return {
                                type:v.type,
                                message:mesg,
                                configure:_.omit(v, 'type', 'message')
                            }
                        });
                    }

                    if (v.subSchema) {
                        var sub = v.subSchema;
                        v.schemaType = 'Object';
                        delete v.subSchema;
                        var np = (v.paths = []);
                        _.each(sub, fixPaths(np));
                    }
                }

            }

            _.each(paths, fixPaths(npaths));
            return model;
        },

        defaults:{
            hidden:false,
            paths:[]
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
            {legend:'Model Info', fields:['modelName']},
            {legend:'Properties', fields:['paths']},
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
                        fields:_.keys(model.paths)
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
                    success:_.bind(this.onSuccess, this)

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
            var form = this.form = new Form(opts);

            function enabled(e) {
                console.log('enabled', e);
                var modelName = form.fields.modelName.getValue()
                if (modelName && modelName.trim().length) {
                    form.fields.paths.$el.find('button').removeAttr('disabled');
                } else {
                    form.fields.paths.$el.find('button').attr('disabled', 'true');
                }

            }

            form.on('modelName:change', enabled);

            form.on('paths:change', function () {
                //update
                var value = this.fields.paths.getValue();

                var values = _.map(form.fields.paths.getValue(), function (v) {
                    return v.name
                })
                form.fields.list_fields.setValue(values);
            });
            form.on('render', function () {
                enabled();
                form.$el.find('> fieldset').furthestDecendant('.controls').css({marginLeft:'160px'})
                    .siblings('label').css({display:'block'}).parents('.controls').css({marginLeft:0}).siblings('label').css({display:'none'});
            })

            return form;
        },
        config:{
            title:'Model',
            plural:'Models'
        }
    });

});
