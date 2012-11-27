define(['Backbone.FormOrig', 'underscore'], function (Form, _) {
    var regexp = Form.validators.regexp
    var rere = /\/*(.*)\/(.*)\/([i,m,g,y]*)/g;
    Form.validators.regexp = function (options) {
        if (_.isString(options.regexp)) {
            var m = rere.exec(options.regexp)
            if (m.length)
                options.regexp = new RegExp(m[2], m[3] || '');
            else
                options.regexp = new RegExp(options.regexp);
        }
        return regexp.apply(this, _.toArray(arguments));
    }
    Form.validators.errMessages.min = "Must be at least {{min}}";
    Form.validators.errMessages.max = "Must be less than {{max}}";
    Form.validators.errMessages.minlength = "Must be at least {{minlength}} charecters";
    Form.validators.errMessages.maxlength = "Must be less than {{maxlength}} charecters";
    Form.validators.errMessages['enum'] = "Must be in an enumerated value {{value}}";

    function fullTrim(str) {
        return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
    };
    Form.validators['enum'] = function(options){
        var e = options['enum']
        if (!e) throw new Error('Missing required "field" options for "enum" validator');
        var vals = _.isString(e) ? e.split(',') : e;
        options = _.extend({
            type:'enum',
            message:this.errMessages['enum']
        },options);
        return function onEnum(value){
            //Don't check empty values (add a 'required' validator for this)
            if (value === null || value === undefined || value === '') return;

            if ( ~vals.indexOf(value)) return {
                type:options.type,
                message:Form.helpers.createTemplate(options.message, options)
            };
        }

    }
    Form.validators.minlength = function (options) {
        if (!options.minlength) throw new Error('Missing required "field" options for "minlength" validator');

        options = _.extend({
            type:'minlength',
            message:this.errMessages.minlength
        }, options);
        var val = parseInt(options.min);
        return function match(value, attrs) {
            options.value = value;

            var err = {
                type:options.type,
                message:Form.helpers.createTemplate(options.message, options)
            };

            //Don't check empty values (add a 'required' validator for this)
            if (value === null || value === undefined || value === '') return;

            if (val > fullTrim(value).length) return err;
        };
    }
    Form.validators.maxlength = function (options) {
        if (!options.maxlength) throw new Error('Missing required "field" options for "maxlength" validator');

        options = _.extend({
            type:'maxlength',
            message:this.errMessages.maxlength
        }, options);
        var val = parseInt(options.min);
        return function match(value, attrs) {
            options.value = value;

            var err = {
                type:options.type,
                message:Form.helpers.createTemplate(options.message, options)
            };

            //Don't check empty values (add a 'required' validator for this)
            if (value === null || value === undefined || value === '') return;

            if (val < fullTrim(value).length) return err;
        };
    }
    Form.validators.min = function (options) {
        if (!options.min) throw new Error('Missing required "field" options for "min" validator');

        options = _.extend({
            type:'min',
            message:this.errMessages.min
        }, options);
        var val = parseFloat(options.min);
        return function min(value, attrs) {
            options.value = value;

            var err = {
                type:options.type,
                message:Form.helpers.createTemplate(options.message, options)
            };

            //Don't check empty values (add a 'required' validator for this)
            if (value === null || value === undefined || value === '') return;

            if (val > parseFloat(value)) return err;
        };
    }
    Form.validators.max = function (options) {
        if (!options.min) throw new Error('Missing required "field" options for "max" validator');

        options = _.extend({
            type:'max',
            message:this.errMessages.max
        }, options);

        var val = parseFloat(options.max);
        return function max(value, attrs) {
            options.value = value;

            var err = {
                type:options.type,
                message:Form.helpers.createTemplate(options.message, options)
            };

            //Don't check empty values (add a 'required' validator for this)
            if (value === null || value === undefined || value === '') return;

            if (val < parseFloat(value)) return err;
        };
    }

    return Form;
})