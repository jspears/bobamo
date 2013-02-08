define(['Backbone.FormOrig', 'underscore', 'libs/util/inflection',
    'mongoose/js/validators',
    'libs/backbone-forms/templates/bootstrap'
], function (Form, _, inflection, validators, bootstrap) {
    // require([ 'libs/backbone-forms/templates/bootstrap']);
    var regexp = Form.validators.regexp
    var rere = /\/*(.*)\/(.*)\/([i,m,g,y]*)/g;
    validators.inject(Form);
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
    var editors = Form.editors;
    _.each(editors, function (v, k) {
        define('libs/editor/' + inflection.hyphenize(k), function onEditorRequire() {
            return v;
        });
    })
    var editors = Form.editors;
    var helpers = Form.helpers;
    /**
     * Trying to maintain some consistency and stuff.
     *
     * New style import <plugin>/<TypeName> maps to <plugin>/js/libs/editors/<type>-<name>-editor
     * Old style import <TypeName> maps to /libs/editors/<type>-<name>-editor
     * @param schemaType
     * @return {*}
     */
    var fixupEditor = function(schemaType){
        if (!schemaType) return schemaType;
        if (~schemaType.indexOf('/')){
            var split = schemaType.split('/');
            var first = split.shift();
            split.unshift('js');
            split.unshift(first);
            return split.concat(fixupEditor(split.pop())).join('/');

        }else{
            return 'libs/editors/' + inflection.hyphenize(schemaType) + (~schemaType.toLowerCase().indexOf('editor') ? '' : '-editor');
        }

    }
    helpers.createEditor = function (schemaType, options, callback) {
        var constructorFn;

        if (_.isString(schemaType)) {
            constructorFn = Form.editors[schemaType];
        } else {
            constructorFn = schemaType;
        }
        if (constructorFn)
            callback(new constructorFn(options));
        else if (schemaType) {
            //detects old style vs new style imports.
//            var st = ~schemaType.indexOf('/') ? schemaType :
//                'libs/editors/' + inflection.hyphenize(schemaType) + (~schemaType.toLowerCase().indexOf('editor') ? '' : '-editor');
            var st = fixupEditor(schemaType);
            console.log('requiring ', schemaType, st);
            require([st], function (Editor) {
                //Sometimes editors didn't return themselves or may actually define
                // more than 1 editor per import, so this checks Form.editors[type] or
                // assumes that it actually did return the correct editor type;
                var E = editors[schemaType] || (editors[schemaType] = Editor);
                callback.call(this, new E(options));
            })
        }
    };

    //Monkey Patch select so that we can get the bobamo functionality.
    // maybe one day I will submit a patch.
    editors.Select.prototype.initialize = function (options) {
        editors.Base.prototype.initialize.call(this, options);

        if (!this.schema || !(this.schema.options || this.schema.url || this.schema.ref || this.schema.collection))
            throw "Missing required 'schema.options' or 'schema.url' or 'schema.ref' or 'schema.collection'";

        if (this.schema.collection) {
            if (_.isString(this.schema.collection))
                require([this.schema.collection], _.bind(this.setOptions, this))
            else
                this.setOptions(this.schema.collection);
        } else if (this.schema.ref) {
            require(['collections/' + this.schema.ref], _.bind(this.setOptions, this));
        }
        return this;
    };
    var init = editors.Text.prototype.initialize;
    //Add place holder support for values that subclass Text, ie. Number.
    editors.Text.prototype.initialize = function () {
        init.apply(this, _.toArray(arguments));
        if (this.schema.placeholder) {
            this.$el.attr('placeholder', this.schema.placeholder);
        }
        return this;
    }

    Form.Field.prototype.render = function () {
        var schema = this.schema,
            templates = Form.templates;

        //Standard options that will go to all editors
        var options = {
            form:this.form,
            key:this.key,
            schema:schema,
            idPrefix:this.options.idPrefix,
            id:this.getId()
        };

        //Decide on data delivery type to pass to editors
        if (this.model) {
            options.model = this.model;
        } else {
            options.value = this.value;
        }

        //Decide on the editor to use
        helpers.createEditor(schema.type, options, _.bind(function (editor) {
            //Create the element
            var $field = $(templates[schema.template](this.renderingContext(schema, editor)));


            //Render editor
            var $tmpEditor =  $field.find('.bbf-tmp-editor')

            var eel = editor.render().el;
                $tmpEditor.replaceWith(eel);

            //Set help text
            this.$help = $('.bbf-tmp-help', $field).parent();
            this.$help.empty();
            if (this.schema.help) this.$help.html(this.schema.help);

            //Create error container
            this.$error = $($('.bbf-tmp-error', $field).parent()[0]);
            if (this.$error) this.$error.empty();

            //Add custom CSS class names
            if (this.schema.fieldClass) $field.addClass(this.schema.fieldClass);

            //Add custom attributes
            if (this.schema.fieldAttrs) $field.attr(this.schema.fieldAttrs);

            //Replace the generated wrapper tag
            this.setElement($field);
            this.editor = editor;
            this.trigger('editor-render');
        }, this));

        return this;

    }
    Form.prototype.render = function onFormRenderAsync() {
        var self = this,
            options = this.options,
            template = Form.templates[options.template];

        //Create el from template
        var $form = $(template({
            fieldsets:'<b class="bbf-tmp"></b>'
        }));

        //Render fieldsets
        var wait = [$.Deferred()];
        var obj = [];
        _.each(options.fieldsets, function (fieldset, k) {
            var d = $.Deferred();
            wait.push(d);
            self.renderFieldset(fieldset, function (rfs) {
                obj[k] = rfs;
                d.resolve();
            });
        });

        $.when.apply($, wait).then(_.bind(function (args) {
            var $fieldsetContainer = $('.bbf-tmp', $form);
            $fieldsetContainer.append.apply($fieldsetContainer, obj);
            $fieldsetContainer.children().unwrap();

            //Set the template contents as the main element; removes the wrapper element
            this.setElement($form);

            if (this.hasFocus) this.trigger('blur', this);
            this.trigger('render');


        },this), function () {
            console.log('oops errors', arguments);
        })
        wait[0].resolve();


        return this;
    }

    Form.prototype.renderFieldset = function renderFieldSetAsync(fieldset, callback) {
        var self = this,
            template = Form.templates[this.options.fieldsetTemplate],
            schema = this.schema,
            getNested = Form.helpers.getNested;

        var wait = [$.Deferred()];
        //Normalise to object
        if (_.isArray(fieldset)) {
            fieldset = { fields:fieldset };
        }


        //Concatenating HTML as strings won't work so we need to insert field elements into a placeholder
        var $fieldset = $(template(_.extend({}, fieldset, {
            legend:'<b class="bbf-tmp-legend"></b>',
            fields:'<b class="bbf-tmp-fields"></b>'
        })));

        //Set legend
        if (fieldset.legend) {
            $fieldset.find('.bbf-tmp-legend').replaceWith(fieldset.legend);
        }
        //or remove the containing tag if there isn't a legend
        else {
            $fieldset.find('.bbf-tmp-legend').parent().remove();
        }

        var $fieldsContainer = $('.bbf-tmp-fields', $fieldset);

        //Render fields
        _.each(fieldset.fields, function (key) {
            //Get the field schema
            var itemSchema = (function () {
                //Return a normal key or path key
                if (schema[key]) return schema[key];

                //Return a nested schema, i.e. Object
                var path = key.replace(/\./g, '.subSchema.');
                return getNested(schema, path);
            })();

            if (!itemSchema) throw "Field '" + key + "' not found in schema";
            var d = $.Deferred();
            wait.push(d)
            //Create the field
            self.createField(key, itemSchema, function (field) {
                field.on('editor-render', _.bind(function () {
                    //Render the fields with editors, apart from Hidden fields
                    var fieldEl = field.el;

                    field.editor.on('all', function (event) {
                        // args = ["change", editor]
                        var args = _.toArray(arguments);
                        args[0] = key + ':' + event;
                        args.splice(1, 0, this);
                        // args = ["key:change", this=form, editor]

                        this.trigger.apply(this, args);
                    }, self);

                    field.editor.on('change', function onChange() {
                        this.trigger('change', self);
                    }, self);

                    field.editor.on('focus', function onFucus() {
                        if (this.hasFocus) return;
                        this.trigger('focus', this);
                    }, self);
                    field.editor.on('blur', function onBlur() {
                        if (!this.hasFocus) return;
                        var self = this;
                        setTimeout(function onTimeoutBlur() {
                            if (_.find(self.fields, function (field) {
                                return field.editor.hasFocus;
                            })) return;
                            self.trigger('blur', self);
                        }, 0);
                    }, self);

                    if (itemSchema.type !== 'Hidden') {
                        $fieldsContainer.append(fieldEl);
                    }
                    self.fields[key] = field;
                    d.resolve(field);
                }), this);
                field.render();
            });
        });

        $.when.apply($, wait).then(function(){
            $fieldsContainer = $fieldsContainer.children().unwrap();
            callback($fieldset);
        })
        wait[0].resolve();
        return $fieldset;
    }
    Form.prototype.createField = function createFieldAsync(key, schema, callback) {
        schema.template = schema.template || this.options.fieldTemplate;

        var options = {
            form:this,
            key:key,
            schema:schema,
            idPrefix:this.options.idPrefix,
            template:this.options.fieldTemplate
        };

        if (this.model) {
            options.model = this.model;
        } else if (this.data) {
            options.value = this.data[key];
        } else {
            options.value = null;
        }

        callback.call(this, new Form.Field(options));
    };
    //Make Object renderer uses the render callback like the others.
    editors.Object.prototype.render = function(){
        //Create the nested form
        this.form = new Form({
            schema: this.schema.subSchema,
            data: this.value,
            idPrefix: this.id + '_',
            fieldTemplate: 'nestedField'
        });

        this._observeFormEvents();
        this.form.on('render', function onObjectFormRender(){
            this.$el.html(this.form.el);
            if (this.hasFocus) this.trigger('blur', this);
        }, this);
        this.form.render();
        return this;
    }
    editors.NestedModel.prototype.render = function(){
        var data = this.value || {},
            key = this.key,
            nestedModel = this.schema.model;

        //Wrap the data in a model if it isn't already a model instance
        var modelInstance = (data.constructor === nestedModel) ? data : new nestedModel(data);
        var opts = {
            model: modelInstance,
            idPrefix: this.id + '_',
            fieldTemplate: 'nestedField'
        }
        this.form = modelInstance&& modelInstance.createForm ? modelInstance.createForm(opts) : new Form(opts);

        this._observeFormEvents();
        this.form.on('render', function onNestedFormRender(){
            this.$el.html(this.form.el);

            if (this.hasFocus) this.trigger('blur', this);

        }, this);
        this.form.render();
        //Render form

        return this;
    }
    return Form;
})