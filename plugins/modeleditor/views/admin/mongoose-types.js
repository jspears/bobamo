define(['exports', 'Backbone', 'modeleditor/js/form-model', 'mongoose/js/validators', 'underscore', 'jquery'], function (exports, b, Form, validators, _, $) {
    "use strict";
    validators.inject(Form);
    var TC = b.Collection.extend({
        parse:function (resp) {
            var ret = resp.payload;
            return ret;
        }
    });

    function json(path, label) {
        var C = TC.extend({
            url:'${pluginUrl}' + path,

            model:b.Model.extend({
                idAttribute:label,
                toString:function () {
                    return this.get(label);
                }
            })
        });
        var collection = new C();
        return collection;

    }

    ;
    var JsonText = Form.editors.JsonTextArea = Form.editors.TextArea.extend({
        setValue:function (obj) {
            var str = '' + JSON.stringify(obj)
            Form.editors.TextArea.prototype.setValue.call(this, str);
        },
        getValue:function () {
            var val = Form.editors.TextArea.prototype.getValue.call(this);
            return JSON.parse(val);
        }
    })

    var Validator = function (type) {
        return b.Model.extend({
                fields:['type', 'message', 'configure'],
                schema:{
                    type:{
                        type:'Select',
                        options:(function (type) {
                            var arr = [];
                            _.each(validators.validators, function (v, k) {
                                if (v.types && v.types.indexOf(type) || !v.types)
                                    arr.push({label:v.name, val:k, validator:v});
                            })
                            return arr;
                        })(type)
                    },
                    message:{type:'Text', help:'Error message to display'},
                    configure:{type:'JsonTextArea', help:'This will be parsed to JSON and passed into the validation method, please use carefully'}
                },
                toString:function () {
                    return this.get('type');
                },
                createForm:function (opts) {
                    var f = this.form = new Form(opts);

                    function onChange() {
                        var type = f.fields.type
                        var options = type.options.schema.options
                        console.log('onChange', options);
                        var value = type.getValue();
                        if (value) {
                            var m = _.where(options, {val:value})
                            if (m && m.length) {
                                m = m[0]
                                if (m.val != this.fields.type.getValue()) {
                                    var mesg = m.validator.message || Form.validators.errMessages[key];
                                    var def = {};
                                    def[m.val] = "";
                                    var config = def;
                                    f.fields.message.setValue(mesg);
                                    f.fields.configure.setValue(f.fields.configure.getValue() || JSON.stringify(config) + "");
                                }
                            }
                        }
                    }

                    f.on("type:change", onChange);
//                    f.on("render", onChange);

                    return f;
                }
            }
        )
    };
    var TM = b.Model.extend({
        parse:function (resp) {
            return resp.payload;
        }
    });
    var DataType = {
        String:TM.extend({
            schema:{

                defaultValue:{type:'Text', help:'Default value for field', title:'Default'},
//                minLength:{type:'Number', help:'Minimum Length'},
//                maxLength:{type:'Number', help:'Maximum Length'},
//                //          match:{type:'Text', help:'Regular Expression'},
                textCase:{type:'Select', options:['none', 'uppercase', 'lowercase'], title:'Case', help:'Save text in specified case'},
                trim:{type:'Checkbox', help:'Trim text\'s white space'},
//                enumValues:{type:'List', help:'Allow only these values'},
                validators:{type:'List', itemType:'NestedModel', model:Validator('String')},
                index:{type:'Checkbox', help:'Index this property'},
                unique:{type:'Checkbox', help:'Make property unique'}
            }
        }),
        Number:TM.extend({
            schema:{
                defaultValue:{type:'Number', help:'Default value for field', title:'Default'},
//                min:{type:'Number', help:'Minimum Value'},
//                max:{type:'Number', help:'Maximum Value'},
                validators:{type:'List', itemType:'NestedModel', model:Validator('Number')}
            }
        }),
        Date:TM.extend({
            schema:{
                defaultValue:{type:'Text', help:'Default time use "now" for the relative current time and "now:-23232" or a value to pass to the constructor' },
                validators:{type:'List', itemType:'NestedModel', model:Validator('Number')}
            }
        }),
        Boolean:TM.extend({
            schema:{
                defaultValue:{type:'Checkbox', help:'Default state', title:'Default'},
                validators:{type:'List', itemType:'NestedModel', model:Validator('Boolean')}
            }
        }),
        ObjectId:TM.extend({
            schema:{
                ref:{
                    type:'Select',
                    options:json('/admin/types/models', 'modelName'),
                    help:'Reference another schema'
                }
            }
        }),
        Buffer:TM.extend({
            schema:{
                maxSize:{type:'Number', help:'Maximum size of buffer (16mb)'},
                unit:{type:'Select', options:['b', 'kb', 'mb']},
                validators:{type:'List', itemType:'NestedModel', model:Validator('Buffer')}
            },
            default:{
                maxSize:1,
                unit:'mb'
            }
        }),
        Object:TM.extend({
            schema:{
                paths:{
                    type:'List',
                    itemType:'NestedModel'
                }
            }
        })
    };

    var schema = {
        schemaType:{
            type:'Select',
            help:'Type of schema',
            required:true,
            options:_.keys(DataType)
        }
    };
    var model = TM.extend({
        schema:schema,
        _schemaTypes:DataType,
        get:function () {
            var ret = TM.prototype.get.apply(this, _.toArray(arguments));
            console.log('get', ret);
            return ret;
        },
        set:function (value, change) {
            console.log('model->set', value);

            //value[value.schemaType] = value;
            //return Form.prototype.setValue.apply(form, _.toArray(arguments))
            var ret = TM.prototype.set.apply(this, _.toArray(arguments));
            console.log('set', ret);

            return ret;
        },
        toJSON:function () {
            var ret = TM.prototype.toJSON.apply(this, _.toArray(arguments));
            console.log('toJSON', ret);
            return ret;

        },
        createForm:function (opts) {
            opts = opts || {};
            opts.fieldsets = this.fieldsets;
            opts._parent = this;
            var form = this.form = new Form(opts);


            if (_.isUndefined(DataType.Object.prototype.schema.paths.model))
                DataType.Object.prototype.schema.paths.model = require('views/modeleditor/admin/property');
            function validation() {
                var val = form.fields.schemaType.getValue();
                var vform = form;
                _.each(DataType, function (v, k) {
                    form.fields[k].$el[val == k ? 'show' : 'hide']();
                });
                var isObj = val == 'Object';
                var show = isObj ? 'show' : 'hide';

                if (this.options && this.options.data && this.options.data.virtual) {
                    form.fields.validation.$el.hide();
                }
            }

            form.on('schemaType:change', validation);
            form.on('render', validation)

            return form;
        }
    });
    _.each(DataType, function (v, k) {
        schema[k] = {
            type:'NestedModel',
            model:v
        }
    });
    return model;

})
;