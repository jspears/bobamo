var pslice = Array.prototype.slice;
var includes = ['underscore', 'Backbone', 'libs/bobamo/edit', 'backbone-modal', 'text!setup/tpl/setup.html',
    'libs/bobamo/backbone-forms/form-model'
]
var reconfigure //${nl}={{json pluginManager.reconfigure}};
for(var i= 0,l=reconfigure.length;i<l;i++)
    includes.push('views/configure-model/'+reconfigure[i]);

define(includes.concat(reconfigure)
    , function (_, B, Edit, Modal, template) {
//        var models = [];
        var schema = {

        };
        var fields = [];
        var args = pslice.call(arguments).slice(includes.length - reconfigure.length);

        _.each(args, function (M,i) {
            var modelName =reconfigure[i];
            if (!modelName)
                return false;
            //var m = new M();
            schema[modelName] = {
                type: 'NestedModel',
                model:M
            };
            fields.push(modelName);
        })
        console.log('schema', fields, schema)
        var Model = B.Model.extend({
            schema: schema,
            url:'${pluginUrl}/admin/configure'
        })
        var View = Edit.extend({
            model: Model,
            template: _.template(template),
            fields: fields,
            createTemplate: _.template('<i class="icon-globe"></i> <%=title%>'),
            config: {
                title: 'Setup Wizard',
                plural: '',
                isWizard: true
            }
        })
        return View;


    });