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

    function fullTrim(str) {
        return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
    }

    var validators = {};
    validators['enum'] = {
        types:['String'],
        name:'Enum',
        message:"Must be an enumerated value: [{{enums}}]",
        validator:function (options) {
            var e = options['enum'] || options['enums'];
            if (!e) throw new Error('Missing required "field" options for "enum" validator');
            var vals = _.isString(e) ? e.split(',') : e;
            options = _.extend({
                type:'enum',
                message:this.errMessages['enum']
            }, options);
            return function onEnum(value) {
                //Don't check empty values (add a 'required' validator for this)
                if (value === null || value === undefined || value === '') return;
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
        validator:function (options) {
            if (!options.minlength) throw new Error('Missing required "field" options for "minlength" validator');

            options = _.extend({
                type:'minlength',
                message:this.errMessages.minlength
            }, options);
            var val = parseInt(options.minlength);
            return function match(value, attrs) {

                //Don't check empty values (add a 'required' validator for this)
                if (value === null || value === undefined || value === '') return;

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
        validator:function (options) {
            if (!options.maxlength) throw new Error('Missing required "field" options for "maxlength" validator');

            options = _.extend({
                type:'maxlength',
                message:this.errMessages.maxlength
            }, options);
            var val = parseInt(options.maxlength);
            return function match(value, attrs) {

                //Don't check empty values (add a 'required' validator for this)
                if (value === null || value === undefined || value === '') return;

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
        validator:function (options) {
            if (!options.min) throw new Error('Missing required "field" options for "min" validator');

            options = _.extend({
                type:'min',
                message:this.errMessages.min
            }, options);
            var val = parseFloat(options.min);
            return function min(value, attrs) {

                //Don't check empty values (add a 'required' validator for this)
                if (value === null || value === undefined || value === '') return;

                if (val > parseFloat(value))
                    return  {
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
        validator:function (options) {
            if (!options.max) throw new Error('Missing required "field" options for "max" validator');

            options = _.extend({
                type:'max',
                message:this.errMessages.max
            }, options);

            var val = parseFloat(options.max);
            return function max(value, attrs) {

                //Don't check empty values (add a 'required' validator for this)
                if (value === null || value === undefined || value === '') return;

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
                message:this.errMessages.required
            }, options);

            return function (value) {

                if (value === null || value === undefined || value === '')
                    return {
                        type:options.type,
                        message:helpers.createTemplate(options.message, options)
                    };
            }
        }
    }
    return {
        validators:validators,
        inject:function (bv) {
            var val = bv ? ( bv.validators || (bv.validators = {})) : {};
            console.log('val', val);
            if (!val.errMessages) val.errMessages = {};
            _.each(this.validators, function (v, k) {
                val.errMessages[k] = v.message;
                val[k] = v.validator;
            })
            return val;
        }
    };
});