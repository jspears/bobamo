define(['Backbone', 'modeleditor/js/form-model', 'underscore'], function (b, Form, _) {
    function findDiff(form) {
        var pfields = form.options._parent.form.fields;
        var paths = _.map(pfields.paths.getValue(), function (v) {
            return v.name
        });
        var f = [];
        _.each(pfields.fieldsets.getValue(), function (v, k) {
            f = f.concat(v.fields);
        });
        var diff = _.without(paths, f);
        return diff;
    }

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

            function fieldOptions(parent, item) {
                console.log('item', item);
                var diff = findDiff(form);
                _.each(form.fields.fields.editor.items, function (itm) {
                    console.log('itm',itm.value, itm.editor.value, itm.editor.$el.val());
                    var val = itm.value || itm.editor.$el.val();
                    var o = !(val || ~diff.indexOf(val)) ? diff : [val].concat(diff);
                    if (!val) itm.value = diff[0];
                    itm.editor.setOptions(o);
                });
                return false;
            }

            form.on('render', fieldOptions);
            form.on('fields:remove', fieldOptions);
            form.on('render', function(){
            form.fields.fields.editor.on('add', fieldOptions);
            });
//            form.on('fields:item:focus', fieldOptions)

//            form.on('all', function () {
//                console.log.apply(console, ['all'].concat(arguments));
//            })
            //   form.on('fields:change', fieldOptions);
            return form;
        }
    });
});