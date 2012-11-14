define([
    'underscore',
    'Backbone',

    'libs/bobamo/edit',
    'modeleditor/js/inflection',
    'text!${pluginUrl}/templates/admin/edit.html',
    'jquery-ui',
    'libs/backbone-forms/editors/list',

    'libs/editors/multi-editor'
], function (_, Backbone, EditView, inflection, template) {
    "use strict";
    var typeOptions = ["Text", "Checkbox", "Checkboxes", "Date", "DateTime", "Hidden", "List", "NestedModel", "Number", "Object",
        "Password", "Radio", "Select", "TextArea", "MultiEditor", "ColorEditor", "UnitEditor", "PlaceholderEditor"];
    var dataTypes = ["text", "tel", "time", "url", "range", "number", "week", "month", "year", "date", "datetime", "datetime-local", "email", "color"];

    var fieldsets = ['modelName', 'plural', 'title', 'hidden', 'labelAttr', 'properties'];

//    schema.fieldsets.itemToString = function (obj) {
//        if (obj.fields && _.isString(obj.fields)) {
//            obj.fields = obj.fields.split(',');
//        }
//        var fields = '[' + obj.fields.join(',') + ']';
//        if (fields.length > 30)
//            fields = fields.substring(0, 27) + '...';
//
//        return obj.legend + ' ' + fields;
//    }


    var Property = Backbone.Model.extend({

        defaults:{
            name:null,
            title:null,
            description:null,
            schemaType:'String',
            ref:null

        },
        schema:{
            name:{type:'Text', required:true},
            title:{type:'Text'},
            description:{type:'Text'},
            required:{type:'Checkbox'},
            unique:{type:'Checkbox', help:'Is this unique to the collection?'},
            editor:{ title:'Editor Type', type:'Select', options:typeOptions, help:'The Editor type helps choose the correct way to change a value for the form.'},
            max:{type:'Number'},
            min:{type:'Number'},
            many:{type:'Checkbox', help:'Is this an array?', title:'Many'},
            placeholder:{type:'Text', help:'Default Placeholder text'},
            schemaType:{
                type:'Select',
                help:'Type of schema',
                required:true,
                options:['String', 'Number', 'Date', 'Buffer', 'Boolean',
                    //'Mixed',  'Array',
                    'ObjectId',  'InlineObject']
            },
            ref:{
                type:'Select',
                options:[
                    {val:'', label:'None'},
                    'User',
                    'Group',
                    'Employee'
                ]
            },
            properties:{
                type:'List',
                itemType:'NestedModel',
                required:true,
                help:'This is where you add properties to this object.'
            }
        },
        fieldsets:[
            { legend:'Property', fields:['name', 'title', 'description', 'many', 'required', 'schemaType', 'placeholder', 'min', 'max', 'editor', 'ref', 'properties']}
        ],
        toString:function () {
            var self = this.toJSON();
            var description = this.get('description');
            return this.get('name') + (description ? ' - ' +  description : '');
        },
        constructor:function () {
            _.bind(this.createForm, this);
            return Backbone.Model.prototype.constructor.apply(this, Array.prototype.slice.call(arguments, 0));

        },
        enabled:function (form, enable) {
            if (enable) {
                form.fields.properties.$el.find('button').removeAttr('disabled');
            } else {
                form.fields.properties.$el.find('button').attr('disabled', 'true');
            }
        },
        createForm:function (opts) {
            console.log('createForm', opts);
            var schemaEvents = this.eventMap['schemaType'];
            opts.fieldsets = this.fieldsets;

            var f = opts.fieldsets[0];
            if (opts._parent && opts._parent.options && opts._parent.options.list && opts._parent.options.list.form) {
                var pform = opts._parent.options.list.form;
                var val = pform.fields.modelName || pform.fields.name;
                var label = val.editor.getValue();
                f.legend = 'Property on "' + label + '"';
            }
            var form = new Backbone.Form(opts);

            var self = this;
            form.on('schemaType:change', function (cont, evt) {
                var type = evt.getValue();
                console.log('schemaType:change', type);
                $.getJSON("${pluginUrl}/admin/editor/"+type, function(resp){
                    form.fields.editor.editor.setOptions(resp.payload);
                });
                schemaEvents[type].call(this, form, cont, evt);
            });
            form.on('name:change', function (cont, evt) {
                self.enabled(form, evt.getValue());
            });

            var r = form.render;
            form.render = function () {
                var ret = r.apply(this, Array.prototype.slice.call(arguments, 0));
                schemaEvents['String'].call(this, form);
                self.enabled(form, false);
                $.getJSON("${pluginUrl}/admin/types", function(resp){
                    form.fields.ref.editor.setOptions(['None'].concat(resp.payload));
                });
                return ret;
            }
            return form;
        },
        eventMap:{
            schemaType:{
                'String':function (form) {
                    form.fields.min.$el.show();
                    form.fields.max.$el.show();
                    form.fields.ref.$el.hide();
                    form.fields.editor.$el.show();

                    form.fields.placeholder.$el.show();
                    form.fields.properties.$el.hide();
                },
                'Number':function (form) {
                    form.fields.min.$el.show();
                    form.fields.max.$el.show();
                    form.fields.ref.$el.hide();
                    form.fields.editor.$el.show();
                    form.fields.placeholder.$el.show();
                    form.fields.properties.$el.hide();
                },
                'Date':function (form) {
                    form.fields.min.$el.hide();
                    form.fields.max.$el.hide();
                    form.fields.ref.$el.hide();
                    form.fields.editor.$el.show();
                    form.fields.placeholder.$el.show();
                    form.fields.properties.$el.hide();
                },
                'Buffer':function (form) {
                    form.fields.min.$el.hide();
                    form.fields.max.$el.hide();
                    form.fields.ref.$el.hide();
                    form.fields.editor.$el.show();
                    form.fields.properties.$el.hide();
                },
                'Boolean':function (form) {
                    form.fields.min.$el.hide();
                    form.fields.max.$el.hide();
                    form.fields.ref.$el.hide();
                    form.fields.editor.$el.show();
                    form.fields.placeholder.$el.show();
                    form.fields.properties.$el.hide();
                },
                //   'Mixed':function(){},
                'ObjectId':function (form) {
                    form.fields.min.$el.hide();
                    form.fields.max.$el.hide();
                    form.fields.ref.$el.show();
                    form.fields.placeholder.$el.hide();
                    form.fields.editor.$el.show();
                    form.fields.properties.$el.hide();
                },
                'InlineObject':function (form) {
                    form.fields.min.$el.hide();
                    form.fields.max.$el.hide();
                    form.fields.ref.$el.hide();
                    form.fields.editor.$el.hide();
                    form.fields.placeholder.$el.hide();
                    form.fields.properties.$el.show();
                }
            }
        }
    });
    Property.prototype.schema.properties.model = Property;
    var schema = {
        "modelName":{
            "title":"Model Name",
            "help":"The model name of the object",
            "type":"Text",
            "path":"modelName"
        },
        "plural":{
            "title":"Plural",
            "help":"The plural of the object",
            "type":"Text",
            "path":"plural"
        },

        "title":{"title":"Title", "help":"The title of the object singular", "type":"Text", "path":"title"},
        "hidden":{"title":"Hidden", "help":"Is this object hidden?", "type":"Checkbox", "path":"hidden"},
        "labelAttr":{"title":"Label Attribute", "help":"This is a label that gives a succinct description of object, dot notation can be used", "path":"labelAttr"},
        "properties":{
            type:'List',
            itemType:'NestedModel',
            model:Property,
            title:'Properties',
            help:'This is where you add properties to this object.'
        }
    };
    var Model = Backbone.Model.extend({
        schema:schema,
//        url:'/modeleditor/admin/model/ProfileImage',
//        parse:function (resp) {
//            console.log('response', resp);
//            return resp.payload;
//        },
        url:"${pluginUrl}/admin/model",
        defaults:{
            modelName:null,
            plural:null,
            title:null,
            hidden:null,
            labelAttr:null,
            properties:null
        },
        idAttribute:'modelName',
        set:function (a, b, c, d) {
            return Backbone.Model.prototype.set.call(this, a, b, c, d)
        },
        get:function (key) {
            if (key && key.indexOf('.') > -1) {
                var split = key.split('.');
                var val = this.attributes;
                //"paths", "meta", "subSchema", "stars", "title"
                if (split.length > 3) {
                    var last = split.pop();
                    var ret = [split.shift()];
                    for (var i = 0, l = split.length; i < l; i++) {
                        ret.push(split[i]);
                        if (i + 1 < l)
                            ret.push('subSchema');
                    }

                    ret.push(last)
                    split = ret;
                    console.log('splits', split.concat());
                }
                while (split.length && val)
                    val = val[split.shift()];

                return val;
            }
            return Backbone.Model.prototype.get.call(this, key);
        }
    });
    return EditView.extend({
        fieldsets:{legend:'Create a new model', fields:fieldsets},
        template:_.template(template),
//        collection:collection,
        model:Model,

        createForm:function (opts) {
            var form = new Backbone.Form(opts);

            function enabled(e) {
                console.log('enabled', e);
                var modelName =               form.fields.modelName.getValue()
                if (modelName) {
                    form.fields.properties.$el.find('button').removeAttr('disabled');
                    form.fields.title.editor.$el.attr('placeholder', inflection.titleize(inflection.humanize(modelName)));
                    form.fields.plural.editor.$el.attr('placeholder', inflection.titleize(inflection.pluralize(inflection.humanize(modelName))));
                } else {
                    form.fields.properties.$el.find('button').attr('disabled', 'true');
                    form.fields.title.editor.$el.removeAttr('placeholder');
                }

            }

            var r = form.render;

            form.on('modelName:change', enabled);
            var nameF = function(v){
                return v.name && v.name.toLowerCase() == 'name'
            }
            var labelF = function(v){
                return v.name && v.name.toLowerCase() == 'label';
            }
            form.on('properties:change', function(){
               //update
                var value = this.fields.properties.getValue();
                var $el = form.fields.labelAttr.editor.$el;
                if (!( value || value.length)){
                     $el.removeAttr('placeholder');
                }else {
                    var v = _.find(value, nameF) || _.find(value, labelF);
                    $el.attr('placeholder', v && v.name || value[0]['name']);
                }
            });
            form.render = function () {

                var ret = r.apply(this, Array.prototype.slice.call(arguments, 0));
                enabled();

                return ret;
            }
            // enabled();
            return form;
        },
        isWizard:false,
        config:{
            title:'Model',
            plural:'Models'
        }
    });

});