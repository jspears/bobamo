define([
    'underscore',
    'Backbone',

    'libs/bobamo/edit',
    'modeleditor/js/inflection',
    'text!${pluginUrl}/templates/admin/edit.html',
    'libs/backbone-forms/editors/list',
    'libs/editors/multi-editor'

], function (_, Backbone, EditView, inflection, template) {
    "use strict";
    var typeOptions = ["Text", "Checkbox", "Checkboxes", "Date", "DateTime", "Hidden", "List", "NestedModel", "Number", "Object",
        "Password", "Radio", "Select", "TextArea", "MultiEditor", "ColorEditor", "UnitEditor", "PlaceholderEditor"];
    var dataTypes = ["text", "tel", "time", "url", "range", "number", "week", "month", "year", "date", "datetime", "datetime-local", "email", "color"];
    //Wizard Support here
    var orender = Backbone.BootstrapModal.prototype.render;

    _.extend(Backbone.BootstrapModal.prototype, {
        render:function (o) {
            orender.apply(this, Array.prototype.slice.call(arguments, 0));
            var $wiz = this.$el.find('.modal-body');
            if ($wiz.wiz) $wiz.wiz({stepKey:'_propStep', clsNames:'', replace:$('a.ok', this.$el)});
            this.$el.find('.cancel').addClass('pull-left');
            return this;
        }
    });
    //end of wizard support;

    var fieldsets = ['modelName', 'plural', 'title', 'hidden'];
    var ValidateMap = {
        'None':function (form) {
            form.fields.enumValues.$el.hide();
            form.fields.match.$el.hide();
        },
        'enumValues':function (form) {
            form.fields.enumValues.$el.show();
            form.fields.match.$el.hide();
        },
        'match':function (form) {
            form.fields.match.$el.show();
            form.fields.enumValues.$el.hide();
        }
    }
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
            form.fields.validators.$el.show();
            form.fields.fieldsets.$el.hide();
        },
        'Number':function (form) {
            form.fields.min.$el.show();
            form.fields.max.$el.show();
            form.fields.ref.$el.hide();
            form.fields.editor.$el.show();
            form.fields.placeholder.$el.show();
            form.fields.paths.$el.hide();
            form.fields.validators.$el.hide();
            form.fields.fieldsets.$el.hide();

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
            form.fields.validators.$el.hide();
            form.fields.fieldsets.$el.hide();

        },
        'Buffer':function (form) {
            form.fields.min.$el.hide();
            form.fields.max.$el.hide();
            form.fields.ref.$el.hide();
            form.fields.editor.$el.show();
            form.fields.paths.$el.hide();
            form.fields.title.$el.show();
            form.fields.description.$el.show();

            form.fields.validators.$el.hide();
            form.fields.fieldsets.$el.hide();
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
            form.fields.validators.$el.hide();
            form.fields.fieldsets.$el.hide();
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
            form.fields.validators.$el.hide();
            form.fields.fieldsets.$el.hide();
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

            form.fields.validators.$el.hide();
            form.fields.fieldsets.$el.show();

        }
    };

    var forender = Backbone.Form.prototype.render;
    Backbone.Form.prototype.render = function () {
        forender.apply(this, Array.prototype.slice.call(arguments, 0));
        this.trigger('render', arguments);
        return this;
    }
    var Fieldset = Backbone.Model.extend({
        defaults:{
            legend:null,
            fields:[],
            description:null,
            wizard:true
        },
        schema:{
            legend:{type:'Text', required:true},
            fields:{type:'List', itemType:'Select', options:[]},
            description:{type:'TextArea'}
        },
        toString:function () {
            return this.get('legend') || 'unnamed';

        },
        createForm:function (opts) {
            var form = new Backbone.Form(opts);

            function fieldOptions() {
                var pfields = form.options._parent.form.fields;
                var paths = _.map(pfields.paths.getValue(), function (v) {
                    return v.name
                });
                var f = [];
                _.each(pfields.fieldsets.getValue(), function (v, k) {
                    f = f.concat(v.fields);
                });
                var diff = _.difference(paths, f);
                _.each(form.fields.fields.editor.items, function(itm){
                    var val = itm.value;
                    var o = val ? [val].concat(diff) : diff;
                    itm.editor.setOptions(o);
                    if (val)
                        itm.setValue(val);
                });

            }
            form.on('render', fieldOptions);
            form.on('fields:change', fieldOptions);
            return form;
        }
    })
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
            description:{type:'TextArea'},
            required:{type:'Checkbox'},
            unique:{type:'Checkbox', help:'Is this unique to the collection?'},
            editor:{ title:'Editor Type', type:'Select', options:typeOptions, help:'The Editor type helps choose the correct way to change a value for the form.'},
            max:{type:'Number'},
            min:{type:'Number'},
            many:{type:'Checkbox', help:'Is this an array?', title:'Many'},
            placeholder:{type:'Text', help:'Default Placeholder text'},
            validators:{type:'Select', options:['None', {label:'enum', val:'enumValues'}, 'match']},
            enumValues:{type:'List', help:'Enumerated Values'},
            match:{type:'Text', help:'Regular Expression Match'},
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
            fieldsets:{
                type:'List',
                itemType:'NestedModel',
                model:Fieldset,
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
            { legend:'Property', fields:['name',  'many', 'type', 'ref', 'paths']},
            { legend:'Validation', fields:['required', 'validators', 'match', 'enumValues', 'min', 'max']},
            { legend:'Editor', fields:['title', 'description', 'placeholder', 'editor', 'fieldsets']}
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

            var validators = function () {
                var val = form.fields.validators.getValue();
                ValidateMap[val].call(this, form);
            };
            form.on('validators:change', validators);
            $('.form-horizontal', form.$el).wiz({stepKey:'_propStep'});

            form.on('render', function () {
                var json = self.toJSON();
                var type = json.type;
                if (_.isFunction(EventMap[type]))
                    EventMap[type].call(this, form);
                self.enabled(form, false);
                validators();
                $.getJSON("${pluginUrl}/admin/types", function (resp) {
                    form.fields.ref.editor.setOptions(['None'].concat(resp.payload));
                });
            });
            return form;
        },
        eventMap:EventMap
    });
    var MatchRe = /^\/.*/gi;

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
                    if (v.dataType){
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
                            v.validator.splice(k, 1, 'match');
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
            modelName:null,
            plural:null,
            title:null,
            hidden:null,
            labelAttr:null,
            paths:null
        },
        idAttribute:'_id',  // changed to _id for MongoDB
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
                var values = _.map(form.fields.paths.getValue(), function (v) {
                    return v.name
                })
                form.fields.list_fields.setValue(values);
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

