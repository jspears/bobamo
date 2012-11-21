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
    var typeOptions = ["Text", "Checkbox", "Checkboxes", "Date", "DateTime", "Hidden", "List", "NestedModel", "Number", "Object",
        "Password", "Radio", "Select", "TextArea", "MultiEditor", "ColorEditor", "UnitEditor", "PlaceholderEditor"];
    var dataTypes = ["text", "tel", "time", "url", "range", "number", "week", "month", "year", "date", "datetime", "datetime-local", "email", "color"];

    var MatchRe = /^\//;


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
        fields:['title', 'plural', 'hidden', 'labelAttr']
    });

    var schema = {
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
    };
    var Model = Backbone.Model.extend({
        schema:schema,
        urlRoot:"${pluginUrl}/admin/backbone/",
        save:function () {
            console.log('saving', this.toJSON());
            Backbone.Model.prototype.save.apply(this, _.toArray(arguments));
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
                        description:model.description,
                        plural:model.plural,
                        hidden:model.hidden || model.display == 'none'
                    };
                    delete model.labelAttr;
                    delete model.title;
                    delete model.description;
                    delete model.plural;
                    delete model.hidden;

                    _.extend(model.display || (model.display = {}), display);


//                    if (v.type == 'List') {
//                        v.many = true;
//                        v.editor = v.listType;
//                        delete v.listType;
//                    } else if (!v.editor) {
//                        v.editor = v.dataType;
//                    }
//                    if (v.dataType) {
//                        var type = v.type;
//                        v.type = v.dataType;
//                        v.editor = type;
//                    }
                    if (v.ref) {
                        v.dataType = 'ObjectId';
                    }

                    if (v.validator && v.validator.length) {
                        var validation = (v.validation = {validate:{}})[v.dataType] = {};
                        validation.validate = _.map(v.validator, function (vv) {
                            var isMatch = MatchRe.test(vv);
                            return {name:isMatch ? 'match' : vv, configure:(isMatch ? JSON.stringify({match:vv}) : "")}
                        });
                    }
                    if (v.subSchema) {
                        var sub = v.subSchema;
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

    return EditView.extend({
        events:_.extend({
            'click .preview':'onPreviewClick'
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
        previewCB:function (model) {
            return _.bind(function (resp) {
                var View = EditView.extend({
                    fieldsets:model.fieldsets,
                    template:_.template(resp),
                    collection:new Backbone.Collection(),
                    model:Backbone.Model.extend({
                        schema:model.paths
                    }),
                    onSave:function(){
                      alert('Save is unavailable in preview')
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
        onPreviewClick:function (e) {
            e.preventDefault();


            this.form.commit();
            var model = this.dataModel.toJSON();
            var editors = {};
            var fixup = function (body) {
                var paths = body.paths;
                delete body.paths;
                var model = _.extend({paths:{}}, body.display, body);

                function onPath(obj) {
                    return function (v, k) {
                        var paths = v.paths;
                        delete v.paths;
                        if (v.type)
                        editors[v.type] = true;
                        var nobj = {};
                        if (paths) {
                            _.each(paths, onPath((nobj.subSchema = {})));
                        }
                        if (v.validation && v.validation[v.dataType]){
                            var validation =  v.validation[v.dataType];
                            delete v.validation;
                            _.extend(nobj, validation);
                        }
                        obj[v.name] = _.extend(nobj, v);
                    }

                }

                _.each(paths, onPath(model.paths))

                model.modelName = body.modelName;
                return model;
            }
            model = fixup(model);
            _.each(model.fieldsets, function(fieldset){
               var fields = fieldset.fields || fieldset || [];
                var idx;
               while(~(idx = fields.indexOf(null)) && fields.splice(idx,1).length);
            });
            model.includes = _.map(_.without(_.keys(editors), _.keys(Form.editors)), function (v, k) {
                return 'libs/editors/' + inflection.hyphenize(v)

            });
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

            var form = new Form(opts);

            function enabled(e) {
                console.log('enabled', e);
                var modelName = form.fields.modelName.getValue()
                var displayFields = form.fields.display.editor.form.fields;
                if (modelName) {
                    form.fields.paths.$el.find('button').removeAttr('disabled');
                    displayFields.title.editor.$el.attr('placeholder', inflection.titleize(inflection.humanize(modelName)));
                    displayFields.plural.editor.$el.attr('placeholder', inflection.titleize(inflection.pluralize(inflection.humanize(modelName))));
                } else {
                    form.fields.paths.$el.find('button').attr('disabled', 'true');
                    displayFields.title.$el.removeAttr('placeholder');
                    displayFields.plural.$el.removeAttr('placeholder');

                }

            }

            form.on('modelName:change', enabled);
            var nameF = function (v) {
                return v.name && v.name.toLowerCase() == 'name'
            }
            var labelF = function (v) {
                return v.name && v.name.toLowerCase() == 'label';
            }
            form.on('paths:change', function () {
                //update
                var value = this.fields.paths.getValue();
                var $el = form.fields.display.editor.form.fields.labelAttr.editor.$el;
                if (!( value || value.length)) {
                    $el.removeAttr('placeholder');
                } else {
                    var v = _.find(value, nameF) || _.find(value, labelF);
                    $el.attr('placeholder', v && v.name || value[0]['name']);
                }
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