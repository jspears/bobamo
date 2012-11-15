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

    var fieldsets = ['modelName', 'plural', 'title', 'hidden'];

    var EventMap = {
        'String':function (form) {
            form.fields.min.$el.show();
            form.fields.max.$el.show();
            form.fields.ref.$el.hide();
            form.fields.editor.$el.show();

            form.fields.placeholder.$el.show();
            form.fields.paths.$el.hide();
            form.fields.title.$el.show();
            form.fields.description.$el.show();
        },
        'Number':function (form) {
            form.fields.min.$el.show();
            form.fields.max.$el.show();
            form.fields.ref.$el.hide();
            form.fields.editor.$el.show();
            form.fields.placeholder.$el.show();
            form.fields.paths.$el.hide();
        },
        'Date':function (form) {
            form.fields.min.$el.hide();
            form.fields.max.$el.hide();
            form.fields.ref.$el.hide();
            form.fields.editor.$el.show();
            form.fields.placeholder.$el.show();
            form.fields.paths.$el.hide();
            form.fields.title.$el.show();
            form.fields.description.$el.show();
        },
        'Buffer':function (form) {
            form.fields.min.$el.hide();
            form.fields.max.$el.hide();
            form.fields.ref.$el.hide();
            form.fields.editor.$el.show();
            form.fields.paths.$el.hide();
            form.fields.title.$el.show();
            form.fields.description.$el.show();
        },
        'Boolean':function (form) {
            form.fields.min.$el.hide();
            form.fields.max.$el.hide();
            form.fields.ref.$el.hide();
            form.fields.editor.$el.show();
            form.fields.placeholder.$el.show();
            form.fields.paths.$el.hide();
            form.fields.title.$el.show();
            form.fields.description.$el.show();
        },
        //   'Mixed':function(){},
        'ObjectId':function (form) {
            form.fields.min.$el.hide();
            form.fields.max.$el.hide();
            form.fields.ref.$el.show();
            form.fields.placeholder.$el.hide();
            form.fields.editor.$el.show();
            form.fields.paths.$el.hide();

            form.fields.title.$el.show();
            form.fields.description.$el.show();
        },
        'Object':function (form) {
            form.fields.min.$el.hide();
            form.fields.max.$el.hide();
            form.fields.ref.$el.hide();
            form.fields.editor.$el.hide();
            form.fields.placeholder.$el.hide();
            form.fields.paths.$el.show();
            form.fields.title.$el.hide();
            form.fields.description.$el.hide();

        }
    };
    var Property = Backbone.Model.extend({

        defaults:{
            name:null,
            title:null,
            description:null,
            type:'String',
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
            type:{
                type:'Select',
                help:'Type of schema',
                required:true,
                options:_.keys(EventMap)
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
            paths:{
                type:'List',
                itemType:'NestedModel',
                required:true,
                title:'Properties',
                help:'This is where you add properties to this object.'
            },
            fields:{
                type:'List',
                help:'Fields to allow editing',
                title:'Edit Fields'
            },
            list_fields:{
                type:'List',
                help:'Fields to show in list views',
                title:'List Fields'
            }
        },
        fieldsets:[
            { legend:'Property', fields:['name', 'title', 'description', 'many', 'required', 'type', 'placeholder', 'min', 'max', 'editor', 'ref', 'paths']}
        ],
        toString:function () {
            var self = this.toJSON();
            var description = this.get('description');
            return this.get('name') + (description ? ' - ' + description : '');
        },
        constructor:function () {
            _.bind(this.createForm, this);
            Backbone.Model.prototype.constructor.apply(this, Array.prototype.slice.call(arguments, 0));
            return this;
        },
        enabled:function (form, enable) {
            if (enable) {
                form.fields.paths.$el.find('button').removeAttr('disabled');
            } else {
                form.fields.paths.$el.find('button').attr('disabled', 'true');
            }
        },
        createForm:function (opts) {
            console.log('createForm', opts);

            opts.fieldsets = this.fieldsets;

            var f = opts.fieldsets[0];

            if (opts._parent && opts._parent.options && opts._parent.options.list && opts._parent.options.list.form) {
                var pform = opts._parent.options.list.form;
                var val = pform.fields.modelName || pform.fields.name;
                var label = val.editor.getValue();
                f.legend = 'Property on "' + label + '"';
            }
            opts._parent = this;
            var form = new Backbone.Form(opts);

            var self = this;
            form.on('type:change', function (cont, evt) {
                var type = evt.getValue();
                console.log('type:change', type);
                $.getJSON("${pluginUrl}/admin/editor/" + type, function (resp) {
                    form.fields.editor.editor.setOptions(resp.payload);
                });
                EventMap[type].call(this, form, cont, evt);
            });
            form.on('name:change', function (cont, evt) {
                self.enabled(form, evt.getValue());

            });

            var r = form.render;
            form.render = function () {
                var ret = r.apply(this, Array.prototype.slice.call(arguments, 0));
               // EventMap[self.get('name') || 'String'].call(this, form);
                var json = self.toJSON();
                var type = json.type;
                if (_.isFunction(EventMap[type])  )
                        EventMap[type].call(this, form);
                 self.enabled(form, false);
                $.getJSON("${pluginUrl}/admin/types", function (resp) {
                    form.fields.ref.editor.setOptions(['None'].concat(resp.payload));
                });
                return ret;
            }
            return form;
        },
        eventMap:EventMap
    });
    Property.prototype.schema.paths.model = Property;
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
        "paths":{
            type:'List',
            itemType:'NestedModel',
            model:Property,
            title:'Properties',
            help:'This is where you add properties to this object.'
        },
        fields:{
            type:'List',
            help:'Fields to allow editing'
        },
        list_fields:{
            type:'List',
            help:'Fields to show in list views'
        }
    };
    var Model = Backbone.Model.extend({
        schema:schema,
//        url:'/modeleditor/admin/model/ProfileImage',
//        parse:function (resp) {
//            console.log('response', resp);
//            return resp.payload;
//        },
        urlRoot:"${pluginUrl}/admin/model",
        parse:function (resp) {
            var model = resp.payload;
            var paths = model.paths;
            delete model.paths;
            var npaths = (model.paths = []);
            var fixPaths = function(p){
                return function(v,k){
                    v.name = k;
                    p.push(v);

                    if (v.subSchema){
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
            modelName:null,
            plural:null,
            title:null,
            hidden:null,
            labelAttr:null,
            paths:null
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
        fieldsets:[
            {legend:'Model Info', fields:fieldsets},
            {legend:'Properties', fields:['paths', 'labelAttr']},
            {legend:'Views', fields:['fields', 'list_fields']}
        ],
        template:_.template(template),
//        collection:collection,
        model:Model,
        constructor:function () {
            EditView.prototype.constructor.apply(this, Array.prototype.slice.call(arguments, 0));


            return this;
        },
        render:function (opts) {
            opts = opts || {};
            opts.modelName = opts.id;
            EditView.prototype.render.apply(this, Array.prototype.slice.call(arguments, 0));
            return this;
        },
        createForm:function (opts) {

            var form = new Backbone.Form(opts);

            function enabled(e) {
                console.log('enabled', e);
                var modelName = form.fields.modelName.getValue()
                if (modelName) {
                    form.fields.paths.$el.find('button').removeAttr('disabled');
                    form.fields.title.editor.$el.attr('placeholder', inflection.titleize(inflection.humanize(modelName)));
                    form.fields.plural.editor.$el.attr('placeholder', inflection.titleize(inflection.pluralize(inflection.humanize(modelName))));
                } else {
                    form.fields.paths.$el.find('button').attr('disabled', 'true');
                    form.fields.title.editor.$el.removeAttr('placeholder');
                }

            }

            var r = form.render;

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
                form.fields.list_fields.editor.setOptions(_.map(form.fields.paths.getValue(), function (v) {
                    return v.name
                }))
            });
            form.render = function () {

                var ret = r.apply(this, Array.prototype.slice.call(arguments, 0));
                enabled();

                return ret;
            }
            // enabled();
            return form;
        },
//        isWizard:true,
        config:{
            title:'Model',
            plural:'Models'
        }
    });

});