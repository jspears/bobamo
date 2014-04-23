var pslice = Array.prototype.slice;
var includes = ['underscore', 'Backbone', 'Backbone.Form', 'libs/bobamo/edit', 'backbone-modal', 'text!setup/tpl/setup.html',
    'libs/bobamo/backbone-forms/form-model'
]
var reconfigure //${nl}={{json pluginManager.reconfigure}};
for (var i = 0, l = reconfigure.length; i < l; i++)
    includes.push('views/configure-model/' + reconfigure[i]);

define(includes, function (_, B, Form, Edit, Modal, template) {
//        var models = [];
    var schema = {

    };
    var fieldsets = [];
    var args = pslice.call(arguments).slice(includes.length - reconfigure.length);

    _.each(args, function (M, i) {
        var modelName = reconfigure[i];
        if (!modelName)
            return false;
        //var m = new M();
        var MP = M.prototype;
        schema[modelName] = {
            type: 'NestedModel',
            model: M,
            fields: MP.fields
        };
        fieldsets.push({
            legend: MP.title,
            fields: [modelName]
        });
    })
    console.log('schema', fieldsets, schema)
    var Model = B.Model.extend({
        schema: schema,
        url: '${pluginUrl}/admin/configure'
    })
    var View = Edit.extend({
        model: Model,
        template: _.template(template),
        fieldsets: fieldsets,
        createTemplate: _.template('<i class="icon-globe"></i> <%=title%>'),
        isWizard: true,
        events:{
            'click .save':'onSave'
        },
        buttons: {
//            'right': [
//                {
//                    html: 'Save',
//                    clsNames: 'save btn-primary',
//                    type: 'button',
//                    events: {
//                        'click .save': 'onSave'
//                    }
//                }
//            ]
        },
        onSuccess:function(){
          Edit.prototype.onSuccess.apply(this, pslice.call(arguments));
          setTimeout(function(){
              window.location.reload();
          }, 3000);
          return;
        },
        createForm: function (opts) {
            var form = Edit.prototype.createForm.apply(this, pslice.call(arguments));
            form.on('render', function () {
                this.wizOptions = _.extend({}, this.wizOptions, {fieldset: form.$('fieldset > legend').parent()    });
            }, this);
            return form;
        },
        config: {
            title: 'Setup Wizard',
            plural: '',
            isWizard: true,
            modelName: 'setup'
        }
    })
    return View;


});