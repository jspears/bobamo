define(['Backbone', 'modeleditor/js/form-model', 'underscore'], function (b, Form, _) {

    return b.Model.extend({
        defaults:{
            legend:null,
            fields:[],
            description:null,
            wizard:true
        },
        schema:{
            legend:{type:'Text', required:true},
            fields:{type:'List', itemType:'Select', options:[]},
            description:{type:'TextArea'}
        },
        toString:function () {
            return this.get('legend') || 'unnamed';

        },
        createForm:function (opts) {
            var form = new Form(opts);

            function fieldOptions(c1, c2, field) {
                var newValue = field && field.$el.val();
                var oldValue = field && field.value;
                var pfields = form.options._parent.form.fields;
                var paths = _.map(pfields.paths.getValue(), function (v) {
                    return v.name
                });
                var f = [];
                _.each(pfields.fieldsets.getValue(), function (v, k) {
                    f = f.concat(v.fields);
                });
                var diff = _.difference(paths, f);
                _.each(form.fields.fields.editor.items, function (itm) {
                    var val = itm.value
                    var o = val ? [val].concat(diff) : diff;
                    if (val == oldValue)
                        itm.value = itm.editor.value = newValue;
                    itm.editor.setOptions(o);
                });

                return false;
            }

            form.on('render', fieldOptions);
            form.on('fields:item:change', fieldOptions);
            return form;
        }
    });
});