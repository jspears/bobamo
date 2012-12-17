define(['exports', 'Backbone', 'modeleditor/js/form-model', 'views/modeleditor/admin/schema-types', 'mongoose/js/validators', 'underscore', 'jquery'], function (exports, b, Form, schemaTypes, validators, _, $) {
    "use strict";
    validators.inject(Form);

    var ValidatorCollection = b.Collection.extend({
        model:b.Model.extend({
            idAttribute:'id',
            toString:function(){
                return this.get('name')
            }
        }),
        filterType:function(type){
           return _.bind(function(cb){
                   cb(_.map(this.filter(function (v, k) {
                       var types = v.get('types');
                       return (types && ~types.indexOf(type) || !types)

                   }), function(v){
                       return {val:v.id, label:""+v}
                   }))
               }, this);
        }
    })

    var Validators = new ValidatorCollection(_.map(validators.validators, function(v,k){
        return _.extend({id:k}, v);
    }));


    var Validator = function (type) {
        return b.Model.extend({
                fields:['type', 'message', 'configure'],
                schema:{
                    type:{
                        type:'Select',
                        options:Validators.filterType(type)
                    },
                    message:{type:'Text', help:'Error message to display'},
                    configure:{
                        type:'Object',
                        subSchema:{}
                    }
                },
                toString:function () {
                    return this.get('type');
                },
                createForm:function (opts) {
                    var config = this.schema.configure.subSchema;
                    _.each(validators.validators, function(v,k){
                        if (v.schema){
                            config[k] = {type:'Object', subSchema:v.schema};
                        }else{
                            config[k] = { type:'Hidden'}
                        }
                    })
                    var form = this.form = new Form(opts);

                    function onChange() {

                        var type = form.fields.type.getValue();
                        var fields = form.fields.configure.editor.form.fields;
                        Validators.each(function (v, k) {
                            fields[v.id].$el[type == v.id ? 'show' : 'hide']();
                        });

                        form.fields.message.$el.attr('placeholder', Form.validators.errMessages[type]);


                    }

                    form.on('schemaType:change', onChange);
                    form.on('type:change', onChange);
                    form.on("render", onChange);

                    return form;
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
                textCase:{type:'Select', options:['none', 'uppercase', 'lowercase'], title:'Case', help:'Save text in specified case'},
                trim:{type:'Checkbox', help:'Trim text\'s white space'},
                validators:{type:'List', itemType:'NestedModel', model:Validator('String')},
                index:{type:'Checkbox', help:'Index this property'},
                unique:{type:'Checkbox', help:'Make property unique'}
            }
        }),
        Number:TM.extend({
            schema:{
                defaultValue:{type:'Number', help:'Default value for field', title:'Default'},
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
                    collection:'views/modeleditor/admin/schema-collection',
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
                schema:{
                    type:'List',
                    itemType:'NestedModel'
                }
            }
        })
    };

    _.each(schemaTypes, function(v,k){
        if (_.isUndefined(v.schemaType) || !_.isUndefined(DataType[v.schemaType]) || ~[ 'DocumentArray', 'Array', 'Oid','Bool', 'Mixed'].indexOf(v.schemaType))
            return;

            DataType[v.schemaType] = TM.extend({
                schema:_.omit(v, 'schemaType')
            });

    });
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
        createForm:function (opts) {
            opts = opts || {};
            opts.fieldsets = this.fieldsets;
            opts._parent = this;
            var form = this.form = new Form(opts);


            if (_.isUndefined(DataType.Object.prototype.schema.schema.model))
                DataType.Object.prototype.schema.schema.model = require('views/modeleditor/admin/property');
            function validation() {
                var fields = form.fields;
                var val = fields.schemaType.getValue();
                _.each(DataType, function (v, k) {
                    fields[k].$el[val == k ? 'show' : 'hide']();
                });
                if (fields[val])
                    fields[val].trigger('schemaType:change', val);

                if (this.options && this.options.data && this.options.data.virtual) {
                    fields.validation.$el.hide();
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
    var editors = (model.editors = {});
    _.each(DataType, function(v,k){
        editors[k] = {type:'Object', subSchema:v.prototype.schema};
    })
    return model;

});