define(['Backbone.FormOrig', 'underscore', 'libs/util/inflection', 'mongoose/js/validators'], function (Form, _, inflection, validators) {
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
    return Form;
})