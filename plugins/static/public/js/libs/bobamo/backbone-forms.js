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


    return Form;
})