define([
    'jquery',
    'underscore',
    'Backbone',
    'libs/jsonform/jsonform',
    'libs/jsv/jsv',
    'text!${pluginUrl}/templates/admin/create.html'
], function ($, _, Backbone, jsonForm, jsv, createTemplate) {
    "use strict";
    console.log('create template');

    var JSONFormView = Backbone.View.extend({
        tagName:"form",
        initialize: function() {
            $('form').jsonForm(
                {
                    "schema":{
                        "fields":{
                            "type":"array",
                            "items":{
                                "type":"object",
                                "title":"Properties",
                                "properties":{
                                    "name":{
                                        "type":"string",
                                        "title":"Name"
                                    },
                                    "dataType":{
                                        "type":"string",
                                        "title":"Data Type",
                                        "enum":[
                                            "string",
                                            "number",
                                            "boolean",
                                            "array",
                                            "object",
                                            "nested",
                                            "reference"
                                        ]
                                    },
                                    "option":{
                                        "type":"string",
                                        "title":"Option"
                                    },
                                    "required":{
                                        "type":"boolean",
                                        "title":"Required"
                                    }
                                }
                            }
                        }
                    },
                    "form":[
                        {
                            "type":"tabarray",
                            "items":{
                                "type":"section",
                                "legend":"Field",
                                "items":[
                                    {
                                        "key":"fields[]",
                                        "title":"Properties of Field"
                                    },
                                    {
                                        "type": "button",
                                        "title": "Click me",
                                        "onClick": function (evt) {
                                            evt.preventDefault();
                                            alert('Thank you!');
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            );
        },
        render:function() {
            var $el = $(this.el);
            return this;
        }
    });

    var CreateModelView =  Backbone.View.extend({
        tagName:'div',
        classNames:['span11'],
        template:_.template(createTemplate),
        jsonFormView:JSONFormView,
        initialize: function(){
            this.render();
        },
        render:function (obj) {
            var jsonForm = new JSONFormView().render().el;
            this.$container = obj && obj.container ? $(obj.container) : $('#content');
            this.$table = $(this.template());
            this.$el.append(this.$table);
            this.$container.empty().append(this.$el);
        }
    });
    return CreateModelView;
});
