define(['Backbone.Form', 'libs/editors/filter-text-editor', 'underscore'], function (Form, FilterText, _) {

    var Integer = Form.editors['Integer'] = FilterText.extend({
        initialize:function (options) {
            var opts = options.schema || (options.schema = {});
            opts.filter = /^[0-9]*$/;
            FilterText.prototype.initialize.call(this, options);

        }
    });
    return Integer;


});
