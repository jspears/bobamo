define(['underscore', 'Backbone', 'Backbone.Form', 'csvimport/parserprovider'], function (_, B, Form, parsers) {
    var ps = {};
    _.each(parsers, function (v) {
        var type = ps[v.type] = {
            type:'Object'
        };
        if (v.schema)
            type.subSchema=v.schema;
        else{
            type.type = 'Hidden';
            type.help = 'No configuration for this parser'
        }
    });
    var schema = {
        type:{
            type:'Select',
            title:'Parser Type',
            search:'q',
            options:_.map(parsers, function (p) {
                return p.type;
            })
        },
        parsers:{
            type:'Object',
            subSchema:ps
        }
    };

    var ValueForm = Form.extend({
        setValue:function(){
            return Form.prototype.setValue.apply(this, arguments);
        },
        getValue:function(){
            return Form.prototype.getValue.apply(this, arguments);

        }
    });
    return B.Model.extend({
        schema:schema,

        showHideParser:function (f, k) {
            f.$el[ k == this._parserType ? 'show' : 'hide' ]();
        },
        showHideParsers:function () {
            this._parserType = this.form.fields.type.getValue();
            _.each(this.form.fields.parsers.editor.form.fields, this.showHideParser, this);
        },
        onChangeParser:function (t, e) {
            console.log('onChangeParser', e.getValue(), this.form.fields.type.getValue());
            this.showHideParsers();
        },
        onSchemaTypeChange:function (t, e) {
            console.log('onSchemaTypeChange', t, e);
        },
        parsersFor:function(type){
            return _.filter(parsers, function(v){
                return !v.types || ~v.types.indexOf(type)
            }).map(function(v){
                    return v.type;
                });
        },


        createForm:function (opts) {
            var schemaType = opts.model && opts.model.schemaType;
            if (schemaType){
                console.log('schemaType', schemaType);
                this.schema.type.options = this.parsersFor(schemaType);
            }
//            var val = opts.pform && opts.pform.options && opts.pform.options._parent.model &&
//                opts.pform.options._parent.model.toJSON();
            var f = this.form = new ValueForm(opts);
            //f.on('all', console.log, console);
            f.on('render', this.showHideParsers, this);
            f.on('type:change', this.onChangeParser, this);
            return f;
        }
    })
});