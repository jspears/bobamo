define([
    'underscore',
    'Backbone',
    'Backbone.Form',
    'text!${pluginUrl}/templates/admin/create.html',
    'jquery-ui',
    'libs/backbone-forms/src/jquery-ui-editors',
    'libs/editors/multi-editor'
], function (_, Backbone, Backbone.Form, jsonForm, jsv, createTemplate) {
    "use strict";
    console.log('create template');

    var User = Backbone.Model.extend({
        schema: {
            title:      { type: 'Select', options: ['', 'Mr', 'Mrs', 'Ms'] },
            name:       'Text',
            email:      { validators: ['required', 'email'] },
            birthday:   'Date',
            password:   'Password',
            notes:      { type: 'List' },
            weapons:    { type: 'List', itemType: 'Object', subSchema: {
                name: { validators: ['required'] },
                number: 'Number'
            }}
        }
    });

    var user = new User({
        title: 'Mr',
        name: 'Sterling Archer',
        email: 'sterling@isis.com',
        birthday: new Date(1978, 6, 12),
        password: 'dangerzone',
        notes: [
            'Buy new turtleneck',
            'Call Woodhouse',
            'Buy booze'
        ],
        weapons: [
            { name: 'Uzi', number: 2 },
            { name: 'Shotgun', number: 1 }
        ]
    });

    var form = new Backbone.Form({
        model: user
    }).render();


    var CreateModelView =  Backbone.View.extend({
        tagName:'div',
        classNames:['span11'],
        template:_.template(createTemplate),
        modelForm:form,
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
