define(['Backbone', 'Backbone.FormOrig', 'underscore'], function(B, Form, _){
    var editors = Form.editors;
    var Base = Form.editors.Base;
    var BP = Base.prototype;
    var helpers = Form.helpers;
    helpers.createEditor = function(schemaType, options, callback) {
        var constructorFn;

        if (_.isString(schemaType)) {
            constructorFn = Form.editors[schemaType];
        } else {
            constructorFn = schemaType;
        }
        if (constructorFn)
            callback(new constructorFn(options));
        else if (schemaType){
            console.log('requiring ', schemaType);
            require([schemaType], function(Editor){
                editors[schemaType] = Editor;
                callback(new Editor(options));
            })
        }
    };

    var Proxy = Base.extend({
        defaultValue: null,
        refEditor:null,
        hasFocus: false,

        initialize: function(options, type) {
            var commands = this._commands = [];
            var self = this;

            require([type], function(Editor){
                Form.editors[type] = Editor;
               var editor = self.refEditor = new Editor(options);
                _.each(self._commands, function(cmd,k){
                    editor[cmd.method].apply(editor, cmd.args);
                }, editor);
            });
            BP.initialize.call(this, options );
            return this;
        },

        getValue: function() {
            return this._proxy('getValue', value);
        },

        setValue: function(value) {
            return this._proxy('setValue', value);
        },

        focus: function() {
            this._proxy('focus', arguments);
        },

        blur: function() {
            this._proxy('blur', arguments);
        },

        /**
         * Get the value for the form input 'name' attribute
         *
         * @return {String}
         *
         * @api private
         */
        getName: function() {
            return this._proxy('getName', arguments, true);
        },

        /**
         * Update the model with the current value
         * NOTE: The method is defined on the editors so that they can be used independently of fields
         *
         * @return {Mixed} error
         */
        commit: function() {
            return this._proxy('commit', arguments, true);
        },

        /**
         * Check validity
         * NOTE: The method is defined on the editors so that they can be used independently of fields
         *
         * @return {String}
         */
        validate: function() {
            return this._proxy('validate', arguments, true);
        },


        trigger: function(event) {
           return this._proxy('trigger', arguments, true);
        },
        _proxy: function(method, args, ret){
            if (this._refEditor){
                return this._refEditor.apply(this._refEditor, method, _.toArray(args));
            }
            this.commands.push( {
                method:method,
                args:args
            });
            if (ret){
                return BP[method].apply(this, _.toArray(arguments));
            }
        }
    });

    return Proxy;
});