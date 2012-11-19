define([
    'underscore',
    'Backbone',
    'views/modeleditor/admin/property',

    'views/modeleditor/admin/fieldset',
    'modeleditor/js/form-model',
    'libs/bobamo/edit',
    'modeleditor/js/inflection',
    'text!${pluginUrl}/templates/admin/edit.html'

], function (_, Backbone, Property,Fieldset, Form, EditView, inflection, template) {
    "use strict";
    var typeOptions = ["Text", "Checkbox", "Checkboxes", "Date", "DateTime", "Hidden", "List", "NestedModel", "Number", "Object",
        "Password", "Radio", "Select", "TextArea", "MultiEditor", "ColorEditor", "UnitEditor", "PlaceholderEditor"];
    var dataTypes = ["text", "tel", "time", "url", "range", "number", "week", "month", "year", "date", "datetime", "datetime-local", "email", "color"];

    var MatchRe = /^\/.*/gi;



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
        urlRoot:"${pluginUrl}/admin/model",
        parse:function (resp) {
            var model = resp.payload;
            var paths = model.paths;
            delete model.paths;
            var npaths = (model.paths = []);
            var fixPaths = function (p) {
                return function (v, k) {
                    v.name = k;
                    p.push(v);
                    if (v.type == 'List') {
                        v.many = true;
                        v.editor = v.listType;
                        delete v.listType;
                    } else if (!v.editor) {
                        v.editor = v.dataType;
                    }
                    if (v.dataType) {
                        var type = v.type;
                        v.type = v.dataType;
                        v.editor = type;
                    }
                    if (v.validator && v.validator.length) {
                        var idx = v.validator.indexOf('required')
                        v.required = idx >= 0;
                        if (v.required) {
                            v.validator.splice(idx, 1);
                        }

                        v.match = _.find(v.validator, function (t, k) {
                           // v.validator.splice(k, 1, 'match');
                            return MatchRe.test(t);

                        });
                        v.validators = v.validator;
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
            fieldset:'.form-container > form > fieldset'
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
                    displayFields.editor.$el.removeAttr('placeholder');
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
                var $el = form.fields.labelAttr.editor.$el;
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
            form.on('render', enabled);


            return form;
        },
        config:{
            title:'Model',
            plural:'Models'
        }
    });

});
