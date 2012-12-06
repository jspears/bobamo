define(['Backbone.FormOrig', 'underscore', 'libs/util/inflection'], function (Form, _, inflection) {
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
    _.each(Form.editors, function(v,k){
        define('libs/editor/'+inflection.hyphenize(k),  function onEditorRequire(){
            return v;
        });
    })

    var init = Form.editors.Text.prototype.initialize;
    Form.editors.Text.prototype.initialize = function(){
        init.apply(this, _.toArray(arguments));
        if (this.schema.placeholder){
            this.$el.attr('placeholder', this.schema.placeholder);
        }
        return this;
    }
    return Form;
})