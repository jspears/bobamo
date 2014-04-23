define([ '../views/admin/mongoose-types','Backbone', 'modeleditor/form-model', 'modeleditor/views/admin/fieldset', 'modeleditor/views/admin/mongoose-types', 'exports', 'underscore', 'Backbone.Form'], function (Types, b, Form, Fieldset, MongooseType, exports, _) {
    return Form.editors.PropertyEditor = editors.NestedModel.extend({
        initialize:function (options) {

            editors.NestedModel.prototype.initialize.call(this, options);

            if (!options.schema.model)
                throw 'Missing required "schema.model" option for NestedModel editor';
        },

        render:function () {
            var data = this.value || {},
                key = this.key,
                nestedModel = this.schema.model;

            //Wrap the data in a model if it isn't already a model instance
            var modelInstance = (data.constructor === nestedModel) ? data : new nestedModel(data);
            var opts = {
                model:modelInstance,
                idPrefix:this.id + '_',
                fieldTemplate:'nestedField'
            }
            this.form = modelInstance && modelInstance.createForm ? modelInstance.createForm(opts) : new Form(opts);

            this._observeFormEvents();

            //Render form
            this.$el.html(this.form.render().el);

            if (this.hasFocus) this.trigger('blur', this);

            return this;
        },
        getValue: function() {

            if (this.form){
                var value = this.form.getValue();
                var dataType = this.form.fields.dataType.getValue();
                return _.extend({dataType:dataType}, this.form.fields[dataType].getValue());

            }

            return this.value;
        },

        setValue: function(value) {
            this.value = value;

            this.render();
        }

    });

});