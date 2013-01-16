define(['underscore'], function (_) {
    "use strict";
    var helpers = {
        compileTemplate:function (str) {
            //Store user's template options
            var _interpolateBackup = _.templateSettings.interpolate;

            //Set custom template settings
            _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

            var template = _.template(str);

            //Reset to users' template settings
            _.templateSettings.interpolate = _interpolateBackup;

            return template;
        },
        createTemplate:function (str, context) {
            var template = this.compileTemplate(str);

            if (!context) {
                return template;
            } else {
                return template(context);
            }
        }
    }

    function check(obj, field) {
        if (_.isUndefined(obj[field]))
            throw new Error('Missing required "field" for "' + field + '" validator')

    }

    function fullTrim(str) {
        return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
    }
    function empty(value){
        return (value === null || value === undefined || value === '')
    }
    var validators = {};
    validators['enum'] = {
        types:['String'],
        name:'Enum',
        message:"Must be an enumerated value: [{{enums}}]",
        schema:{
            enums:{type:'List'}
        },
        validator:function onEnumValidator(options) {
            var e = options['enum'] || options['enums'];
            if (!e) throw new Error('Missing required "field" options for "enum" validator');
            var vals = _.isString(e) ? e.split(',') : e;
            options = _.extend({
                type:'enum',
                message:validators.errMessages && validators.errMessages['enum'] || validators['enum'].message
            }, options);
            return function onEnum(value) {
                //Don't check empty values (add a 'required' validator for this)
                if (empty(value)) return;
                if (!~vals.indexOf(value)) {

                    return {
                        type:options.type,
                        message:helpers.createTemplate(options.message, _.extend({value:value, enums:vals}, options))
                    }
                }
            }

        }
    }
    validators.minlength = {
        types:['String'],
        name:'Mininum Length',
        message:"Must be at least {{minlength}} charecters",
        schema:{
            minlength:{type:'Number'}
        },
        validator:function onMinLengthValidator(options) {
            check(options, 'minlength');

            options = _.extend({
                type:'minlength',
                message:this.message
            }, options);
            var val = parseInt(options.minlength);
            return function onMinLength(value, attrs) {

                //Don't check empty values (add a 'required' validator for this)
                if (empty(value)) return;
                if (val > fullTrim(value).length)
                    return  {
                        type:options.type,
                        message:helpers.createTemplate(options.message, _.extend({value:value}, options))
                    };
            };
        }
    }
    validators.maxlength = {
        types:['String'],
        name:'Maximum Length',
        message:"Must be less than {{maxlength}} charecters",
        schema:{
            maxlength:{type:'Number'},
            trim:{type:'Checkbox'}
        },
        validator:function onMaxLengthValidator(options) {
            check(options, 'maxlength');

            options = _.extend({
                type:'maxlength',
                message:this.errMessages.maxlength
            }, options);
            var val = parseInt(options.maxlength);
            return function onMaxLength(value, attrs) {

                //Don't check empty values (add a 'required' validator for this)
                if (empty(value))
                    return;

                if (val < fullTrim(value).length) return {
                    type:options.type,
                    message:helpers.createTemplate(options.message, _.extend({value:value}, options))
                };
            };
        }
    };

    validators.min = {
        types:['Number'],
        name:'Minimum',
        message:"Must be more than {{min}}",
        schema:{
            min:{type:'Number'}
        },
        validator:function (options) {
            check(options, 'min');
            options = _.extend({
                type:'min',
                message:this.errMessages.min
            }, options);
            var val = parseFloat(options.min);
            return function min(value, attrs) {

                //Don't check empty values (add a 'required' validator for this)
                if (empty(value)) return;
                if (val > parseFloat(value))
                    return  {
                        type:options.type,
                        message:helpers.createTemplate(options.message, _.extend({value:value}, options))
                    };
            };
        }
    }
    validators.regexp = {
        types:['String'],
        name:'RegExp',
        message:'Not a valid value',
        schema:{
            regexp:{type:'String'}
        },
        validator:function(options){
            check(options, 'regexp');
            options = _.extend({
                type:'regexp',
                message:this.errMessages && this.errMessages.regexp
            }, options);
            var re = new RegExp(options.regexp);
            return function regexp(value, attrs) {

                //Don't check empty values (add a 'required' validator for this)
                if (empty(value)) return;
                if (re.text(value)) return {
                    type:options.type,
                    message:helpers.createTemplate(options.message, _.extend({value:value}, options))
                };

            };

        }
    }
    validators.max = {
        types:['Number'],
        name:'Maximum',
        message:"Must be less than {{max}}",
        schema:{
            max:{type:'Number'}
        },
        validator:function (options) {
            check(options, 'max');

            options = _.extend({
                type:'max',
                message:this.errMessages.max
            }, options);

            var val = parseFloat(options.max);
            return function max(value, attrs) {

                //Don't check empty values (add a 'required' validator for this)
                if (empty(value)) return;
                if (val < parseFloat(value)) return {
                    type:options.type,
                    message:helpers.createTemplate(options.message, _.extend({value:value}, options))
                };

            };
        }
    }
    validators.required = {
        name:'Required',
        message:'Required',
        validator:function (options) {

            options = _.extend({
                type:'required',
                message:this.errMessages && this.errMessages.required
            }, options);

            return function (value) {
                if (empty(value))
                    return {
                        type:options.type,
                        message:helpers.createTemplate(options.message, options)
                    };
            }
        }
    }
    validators.match = {
        name:'Match',
        message:'Does not match {{field}}',
        schema:{
            match:{type:'Text'}
        },
        validator:function (options, attrs) {
            check(options, 'match');
            return function (value) {
                if (empty(value))
                    return;

                attrs = attrs || this;

                if (value !== attrs[options.field]) return {
                    type:options.type,
                    message:Form.helpers.createTemplate(options.message, _.extend({value:value}, options))
                };
            }
        }
    }

    return {
        validators:validators,
        inject:function (bv) {
            var val = bv ? ( bv.validators || (bv.validators = {})) : {};
            if (!val.errMessages) val.errMessages = {};
            _.each(this.validators, function (v, k) {
                val.errMessages[k] = v.message;
                val[k] = v.validator;
            })
            return val;
        }
    };
});