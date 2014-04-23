define(['underscore', 'Backbone', 'Backbone.Form/form-model', 'libs/util/inflection'], function(_, Backbone,Form, inflection){
    "use strict";
    return Backbone.Model.extend({
        schema:{
            "title":{"title":"Title", "help":"The title of the object singular", "type":"Text"},
            "plural":{
                "title":"Plural",
                "help":"The plural of the object",
                "type":"Text"
            },
            "hidden":{"title":"Hidden", "help":"Is this object hidden?", "type":"Checkbox"},
            "labelAttr":{"title":"Label Attribute", "help":"This is a label that gives a succinct description of object, dot notation can be used"}
        },
        fields:['title', 'plural', 'hidden', 'labelAttr'],
        createForm:function (opts) {
            var form = this.form = new Form(opts);
            var pform = opts.pform;
            if (pform && pform.fields.modelName) {
                var onModelName = function () {
                    var modelName = pform.fields.modelName.getValue();
                    form.fields.title.editor.$el.attr('placeholder', inflection.titleize(inflection.humanize(modelName)));
                    form.fields.plural.editor.$el.attr('placeholder', inflection.titleize(inflection.pluralize(inflection.humanize(modelName))));
                };
                pform.on('modelName:change', onModelName);
                pform.on('render', onModelName);
                pform.on('paths:change', function () {
                    //update
                    var value = _.map(pform.fields.schema.getValue(), function (v) {
                        return {schemaType:v.persistence.schemaType, name:v.name};
                    });
                    var $el = form.fields.labelAttr.editor.$el;
                    if (!( value || value.length)) {
                        $el.removeAttr('placeholder');
                    } else {
                        var pv = _.pluck(_.where(value, {schemaType:'String'}), 'name');
                        if (pv.length) {
                            var labelAttr = ((~pv.indexOf('name') && 'name') || (~pv.indexOf('label') && 'label') || (~pv.indexOf('description') && 'description') || pv[0]);
                            $el.attr('placeholder', labelAttr);
                        }
                    }

                });
            }

            return form;
        }
    });
});